from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime


class Note(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    category_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.id")
    title: Optional[str] = None
    content: Optional[str] = None
    order_index: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
