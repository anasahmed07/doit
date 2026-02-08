from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from backend.core.database import get_session
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.project import Project, ProjectTask
from backend.models.note import Note
from pydantic import BaseModel

router = APIRouter()

class DashboardStats(BaseModel):
    total_projects: int
    active_tasks: int
    completed_tasks: int
    total_notes: int

@router.get("/", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    total_projects = session.exec(
        select(func.count(Project.id)).where(Project.user_id == current_user.id)
    ).one()

    active_tasks = session.exec(
        select(func.count(ProjectTask.id))
        .join(Project)
        .where(Project.user_id == current_user.id)
        .where(ProjectTask.status != "DONE")
    ).one()

    completed_tasks = session.exec(
        select(func.count(ProjectTask.id))
        .join(Project)
        .where(Project.user_id == current_user.id)
        .where(ProjectTask.status == "DONE")
    ).one()

    total_notes = session.exec(
        select(func.count(Note.id)).where(Note.user_id == current_user.id)
    ).one()

    return DashboardStats(
        total_projects=total_projects,
        active_tasks=active_tasks,
        completed_tasks=completed_tasks,
        total_notes=total_notes
    )
