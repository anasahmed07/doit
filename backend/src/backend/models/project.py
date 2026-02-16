from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import uuid
from datetime import datetime

class Project(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    name: str
    framework: str = Field(default="KANBAN_FIXED") # Enum: KANBAN_FIXED
    is_default: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    tasks: List["ProjectTask"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    members: List["ProjectMember"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class ProjectTask(SQLModel, table=True):
    __tablename__ = "project_task"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id")
    status: str = Field(default="TODO") # Enum: TODO, IN_PROGRESS, DONE
    priority: str = Field(default="MEDIUM") # Enum: LOW, MEDIUM, HIGH
    due_date: Optional[datetime] = Field(default=None)
    content: str
    order_index: float = Field(default=0.0)
    assignee_id: Optional[uuid.UUID] = Field(default=None, index=True)  # user.id of assigned member
    is_archived: bool = Field(default=False)
    archived_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    project: Optional[Project] = Relationship(back_populates="tasks")

class ProjectMember(SQLModel, table=True):
    __tablename__ = "project_member"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id", index=True)
    user_id: uuid.UUID = Field(index=True)
    role: str = Field(default="member")  # "owner" or "member"
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    project: Optional[Project] = Relationship(back_populates="members")
