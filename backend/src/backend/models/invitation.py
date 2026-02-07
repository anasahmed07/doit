from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime


class ProjectInvitation(SQLModel, table=True):
    __tablename__ = "project_invitation"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id", index=True)
    inviter_id: uuid.UUID = Field(index=True)  # user who sent the invite
    invitee_id: uuid.UUID = Field(index=True)  # user who receives the invite
    status: str = Field(default="pending")  # "pending", "accepted", "declined"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
