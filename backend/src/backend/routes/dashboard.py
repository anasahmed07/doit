from fastapi import APIRouter, Depends
from sqlmodel import Session, select
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
    # Total Projects
    projects = session.exec(select(Project).where(Project.user_id == current_user.id)).all()
    
    # Tasks
    active_tasks = session.exec(
        select(ProjectTask)
        .join(Project)
        .where(Project.user_id == current_user.id)
        .where(ProjectTask.status != "DONE")
    ).all()
    
    completed_tasks = session.exec(
        select(ProjectTask)
        .join(Project)
        .where(Project.user_id == current_user.id)
        .where(ProjectTask.status == "DONE")
    ).all()

    # Total Notes
    notes = session.exec(select(Note).where(Note.user_id == current_user.id)).all()

    return DashboardStats(
        total_projects=len(projects),
        active_tasks=len(active_tasks),
        completed_tasks=len(completed_tasks),
        total_notes=len(notes)
    )
