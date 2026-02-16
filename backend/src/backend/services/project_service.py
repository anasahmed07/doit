from sqlmodel import Session, select
from typing import List, Optional, Any
import uuid
from backend.models.project import Project, ProjectTask
from backend.models.notification import Notification
from datetime import datetime

_UNSET: Any = ...  # Sentinel to distinguish "not provided" from None

class ProjectService:
    def __init__(self, session: Session):
        self.session = session

    def ensure_default_project(self, user_id: uuid.UUID) -> None:
        statement = select(Project).where(
            Project.user_id == user_id,
            Project.is_default == True
        )
        existing = self.session.exec(statement).first()
        if not existing:
            project = Project(
                user_id=user_id,
                name="Default",
                framework="KANBAN_FIXED",
                is_default=True
            )
            self.session.add(project)
            self.session.commit()

    def get_projects(self, user_id: uuid.UUID) -> List[Project]:
        self.ensure_default_project(user_id)
        statement = select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
        results = self.session.exec(statement)
        return results.all()

    def create_project(self, project: Project) -> Project:
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
        return project

    def get_project_by_id(self, project_id: uuid.UUID) -> Optional[Project]:
        return self.session.get(Project, project_id)

    def update_project(self, project_id: uuid.UUID, name: Optional[str] = None, framework: Optional[str] = None) -> Optional[Project]:
        project = self.session.get(Project, project_id)
        if not project:
            return None
        if name is not None:
            project.name = name
        if framework is not None:
            project.framework = framework
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
        return project

    def delete_project(self, project_id: uuid.UUID) -> bool:
        project = self.session.get(Project, project_id)
        if not project:
            return False
        self.session.delete(project)
        self.session.commit()
        return True

    def get_project_tasks(self, project_id: uuid.UUID) -> List[ProjectTask]:
        statement = (
            select(ProjectTask)
            .where(ProjectTask.project_id == project_id, ProjectTask.is_archived == False)
            .order_by(ProjectTask.order_index, ProjectTask.created_at.asc())
        )
        results = self.session.exec(statement)
        return results.all()

    def get_archived_tasks(self, project_id: uuid.UUID) -> List[ProjectTask]:
        statement = (
            select(ProjectTask)
            .where(ProjectTask.project_id == project_id, ProjectTask.is_archived == True)
            .order_by(ProjectTask.archived_at.desc())
        )
        results = self.session.exec(statement)
        return results.all()

    def archive_task(self, task_id: uuid.UUID) -> Optional[ProjectTask]:
        task = self.session.get(ProjectTask, task_id)
        if not task:
            return None
        task.is_archived = True
        task.archived_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def unarchive_task(self, task_id: uuid.UUID) -> Optional[ProjectTask]:
        task = self.session.get(ProjectTask, task_id)
        if not task:
            return None
        task.is_archived = False
        task.archived_at = None
        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def create_project_task(self, task: ProjectTask) -> ProjectTask:
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_project_task_by_id(self, task_id: uuid.UUID) -> Optional[ProjectTask]:
        return self.session.get(ProjectTask, task_id)

    def update_project_task(self, task_id: uuid.UUID, status: Optional[str] = None, content: Optional[str] = None, order_index: Optional[float] = None, priority: Optional[str] = None, due_date: Any = _UNSET, assignee_id: Any = _UNSET) -> Optional[ProjectTask]:
        task = self.session.get(ProjectTask, task_id)
        if not task:
            return None

        if status is not None:
            task.status = status
        if content is not None:
            task.content = content
        if order_index is not None:
            task.order_index = order_index
        if priority is not None:
            task.priority = priority
        # due_date uses sentinel: _UNSET means "not provided", None means "clear it"
        if due_date is not _UNSET:
            task.due_date = due_date

        # assignee_id: detect change and create notification
        if assignee_id is not _UNSET:
            old_assignee = task.assignee_id
            task.assignee_id = assignee_id
            if assignee_id is not None and assignee_id != old_assignee:
                notification = Notification(
                    user_id=assignee_id,
                    type="task_assigned",
                    title="Task assigned to you",
                    message=f'You were assigned to "{task.content}".',
                    reference_id=task.id,
                )
                self.session.add(notification)

        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def delete_project_task(self, task_id: uuid.UUID) -> bool:
        task = self.session.get(ProjectTask, task_id)
        if not task:
            return False
        self.session.delete(task)
        self.session.commit()
        return True
