from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List, Optional
from backend.core.database import get_session
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.project import Project, ProjectTask
from backend.services.project_service import ProjectService
import uuid
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic models
class ProjectCreate(BaseModel):
    name: str
    framework: str = "KANBAN_FIXED"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    framework: Optional[str] = None

class ProjectRead(BaseModel):
    id: uuid.UUID
    name: str
    framework: str
    is_default: bool
    created_at: datetime

class ProjectTaskCreate(BaseModel):
    content: str
    status: str = "TODO"
    priority: str = "MEDIUM"
    due_date: Optional[datetime] = None

class ProjectTaskUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[str] = None
    order_index: Optional[float] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[uuid.UUID] = None

class ProjectTaskRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    status: str
    content: str
    order_index: float
    priority: str
    due_date: Optional[datetime]
    assignee_id: Optional[uuid.UUID] = None
    is_archived: bool
    archived_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

@router.get("/", response_model=List[ProjectRead])
def read_projects(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    return service.get_projects(current_user.id)

@router.post("/", response_model=ProjectRead)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    project = Project(
        user_id=current_user.id,
        name=project_in.name,
        framework=project_in.framework
    )
    return service.create_project(project)

@router.get("/{project_id}", response_model=ProjectRead)
def read_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    project = service.get_project_by_id(project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: uuid.UUID,
    project_in: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    project = service.get_project_by_id(project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = service.update_project(
        project_id,
        name=project_in.name,
        framework=project_in.framework
    )
    return updated

@router.delete("/{project_id}")
def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    project = service.get_project_by_id(project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.is_default:
        raise HTTPException(status_code=403, detail="Cannot delete default project")
    service.delete_project(project_id)
    return {"ok": True}

@router.get("/{project_id}/tasks", response_model=List[ProjectTaskRead])
def read_project_tasks(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    project = service.get_project_by_id(project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return service.get_project_tasks(project_id)

@router.get("/{project_id}/tasks/archived", response_model=List[ProjectTaskRead])
def read_archived_tasks(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    project = service.get_project_by_id(project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return service.get_archived_tasks(project_id)

@router.post("/{project_id}/tasks", response_model=ProjectTaskRead)
def create_project_task(
    project_id: uuid.UUID,
    task_in: ProjectTaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    project = service.get_project_by_id(project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    task = ProjectTask(
        project_id=project_id,
        content=task_in.content,
        status=task_in.status,
        priority=task_in.priority,
        due_date=task_in.due_date
    )
    return service.create_project_task(task)

@router.patch("/tasks/{task_id}", response_model=ProjectTaskRead)
def update_project_task(
    task_id: uuid.UUID,
    task_in: ProjectTaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    task = service.get_project_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check project ownership
    project = service.get_project_by_id(task.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    # Use model_fields_set to know which fields were explicitly provided
    fields_set = task_in.model_fields_set
    return service.update_project_task(
        task_id,
        status=task_in.status if "status" in fields_set else None,
        content=task_in.content if "content" in fields_set else None,
        order_index=task_in.order_index if "order_index" in fields_set else None,
        priority=task_in.priority if "priority" in fields_set else None,
        due_date=task_in.due_date if "due_date" in fields_set else ...,
        assignee_id=task_in.assignee_id if "assignee_id" in fields_set else ...,
    )

@router.patch("/tasks/{task_id}/archive", response_model=ProjectTaskRead)
def archive_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    task = service.get_project_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = service.get_project_by_id(task.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    return service.archive_task(task_id)

@router.patch("/tasks/{task_id}/unarchive", response_model=ProjectTaskRead)
def unarchive_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    task = service.get_project_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = service.get_project_by_id(task.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    return service.unarchive_task(task_id)

@router.delete("/tasks/{task_id}")
def delete_project_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ProjectService(session)
    task = service.get_project_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check project ownership
    project = service.get_project_by_id(task.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    service.delete_project_task(task_id)
    return {"ok": True}
