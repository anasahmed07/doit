from sqlmodel import SQLModel, Field
import uuid
from datetime import datetime


class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    name: str
    color: str = Field(default="#000000")
    created_at: datetime = Field(default_factory=datetime.utcnow)
