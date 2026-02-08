from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime


class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)  # recipient
    type: str  # "project_invitation", "invitation_accepted", "task_assigned"
    title: str
    message: str
    reference_id: Optional[uuid.UUID] = None  # e.g. invitation_id or task_id
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
