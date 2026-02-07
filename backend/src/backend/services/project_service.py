from sqlmodel import Session, select
from typing import List, Optional
import uuid
from backend.models.project import Project, ProjectTask
from datetime import datetime

class ProjectService:
    def __init__(self, session: Session):
        self.session = session

    def get_projects(self, user_id: uuid.UUID) -> List[Project]:
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

    def update_project(self, project_id: uuid.UUID, name: Optional[str] = None) -> Optional[Project]:
        project = self.session.get(Project, project_id)
        if not project:
            return None
        if name is not None:
            project.name = name
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
        statement = select(ProjectTask).where(ProjectTask.project_id == project_id).order_by(ProjectTask.order_index, ProjectTask.created_at.asc())
        results = self.session.exec(statement)
        return results.all()

    def create_project_task(self, task: ProjectTask) -> ProjectTask:
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_project_task_by_id(self, task_id: uuid.UUID) -> Optional[ProjectTask]:
        return self.session.get(ProjectTask, task_id)

    def update_project_task(self, task_id: uuid.UUID, status: Optional[str] = None, content: Optional[str] = None, order_index: Optional[float] = None) -> Optional[ProjectTask]:
        task = self.session.get(ProjectTask, task_id)
        if not task:
            return None
        
        if status is not None:
            task.status = status
        if content is not None:
            task.content = content
        if order_index is not None:
            task.order_index = order_index
            
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
