from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, col
from backend.core.database import get_session
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.project import Project, ProjectTask
from backend.models.note import Note
from backend.models.notification import Notification
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()


class TaskByStatus(BaseModel):
    status: str
    count: int


class TaskByPriority(BaseModel):
    priority: str
    count: int


class UpcomingTask(BaseModel):
    id: str
    content: str
    due_date: str
    priority: str
    status: str
    project_name: str


class ProjectProgress(BaseModel):
    id: str
    name: str
    total_tasks: int
    completed_tasks: int


class RecentActivity(BaseModel):
    id: str
    type: str
    title: str
    message: str
    created_at: str


class DashboardStats(BaseModel):
    total_projects: int
    active_tasks: int
    completed_tasks: int
    total_tasks: int
    total_notes: int
    overdue_count: int
    completion_rate: float
    tasks_by_status: list[TaskByStatus]
    tasks_by_priority: list[TaskByPriority]
    upcoming_deadlines: list[UpcomingTask]
    overdue_tasks: list[UpcomingTask]
    project_progress: list[ProjectProgress]
    recent_activity: list[RecentActivity]


@router.get("/", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Base query: all projects the user owns
    user_project_ids = session.exec(
        select(Project.id).where(Project.user_id == current_user.id)
    ).all()

    total_projects = len(user_project_ids)

    # All non-archived tasks across user's projects
    all_tasks = session.exec(
        select(ProjectTask)
        .join(Project)
        .where(Project.user_id == current_user.id)
        .where(ProjectTask.is_archived == False)
    ).all()

    total_tasks = len(all_tasks)
    active_tasks = sum(1 for t in all_tasks if t.status != "DONE")
    completed_tasks = sum(1 for t in all_tasks if t.status == "DONE")
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Tasks by status
    status_counts = {"TODO": 0, "IN_PROGRESS": 0, "DONE": 0}
    for t in all_tasks:
        if t.status in status_counts:
            status_counts[t.status] += 1
    tasks_by_status = [
        TaskByStatus(status=s, count=c) for s, c in status_counts.items()
    ]

    # Tasks by priority
    priority_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    for t in all_tasks:
        if t.priority in priority_counts:
            priority_counts[t.priority] += 1
    tasks_by_priority = [
        TaskByPriority(priority=p, count=c) for p, c in priority_counts.items()
    ]

    # Overdue tasks (due_date in the past, not DONE)
    now = datetime.utcnow()
    overdue = [
        t for t in all_tasks
        if t.due_date and t.due_date < now and t.status != "DONE"
    ]
    overdue.sort(key=lambda t: t.due_date)

    # Build overdue task list with project names
    project_name_map = {}
    if overdue or any(t.due_date for t in all_tasks):
        projects = session.exec(
            select(Project).where(Project.user_id == current_user.id)
        ).all()
        project_name_map = {str(p.id): p.name for p in projects}

    overdue_tasks = [
        UpcomingTask(
            id=str(t.id),
            content=t.content,
            due_date=t.due_date.isoformat() if t.due_date else "",
            priority=t.priority,
            status=t.status,
            project_name=project_name_map.get(str(t.project_id), "Unknown")
        )
        for t in overdue[:10]
    ]

    # Upcoming deadlines (due within next 7 days, not DONE)
    week_from_now = now + timedelta(days=7)
    upcoming = [
        t for t in all_tasks
        if t.due_date and now <= t.due_date <= week_from_now and t.status != "DONE"
    ]
    upcoming.sort(key=lambda t: t.due_date)
    upcoming_deadlines = [
        UpcomingTask(
            id=str(t.id),
            content=t.content,
            due_date=t.due_date.isoformat() if t.due_date else "",
            priority=t.priority,
            status=t.status,
            project_name=project_name_map.get(str(t.project_id), "Unknown")
        )
        for t in upcoming[:10]
    ]

    # Project progress
    if not project_name_map:
        projects = session.exec(
            select(Project).where(Project.user_id == current_user.id)
        ).all()
        project_name_map = {str(p.id): p.name for p in projects}

    project_task_counts: dict[str, dict[str, int]] = {}
    for t in all_tasks:
        pid = str(t.project_id)
        if pid not in project_task_counts:
            project_task_counts[pid] = {"total": 0, "completed": 0}
        project_task_counts[pid]["total"] += 1
        if t.status == "DONE":
            project_task_counts[pid]["completed"] += 1

    project_progress = [
        ProjectProgress(
            id=pid,
            name=project_name_map.get(pid, "Unknown"),
            total_tasks=counts["total"],
            completed_tasks=counts["completed"]
        )
        for pid, counts in project_task_counts.items()
    ]
    # Sort by most tasks first
    project_progress.sort(key=lambda p: p.total_tasks, reverse=True)

    # Total notes
    total_notes = session.exec(
        select(func.count(Note.id)).where(Note.user_id == current_user.id)
    ).one()

    # Recent activity from notifications
    notifications = session.exec(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(col(Notification.created_at).desc())
        .limit(8)
    ).all()
    recent_activity = [
        RecentActivity(
            id=str(n.id),
            type=n.type,
            title=n.title,
            message=n.message,
            created_at=n.created_at.isoformat()
        )
        for n in notifications
    ]

    return DashboardStats(
        total_projects=total_projects,
        active_tasks=active_tasks,
        completed_tasks=completed_tasks,
        total_tasks=total_tasks,
        total_notes=total_notes,
        overdue_count=len(overdue),
        completion_rate=round(completion_rate, 1),
        tasks_by_status=tasks_by_status,
        tasks_by_priority=tasks_by_priority,
        upcoming_deadlines=upcoming_deadlines,
        overdue_tasks=overdue_tasks,
        project_progress=project_progress,
        recent_activity=recent_activity,
    )
