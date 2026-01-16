from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from datetime import datetime

# Forward reference for Note if needed in future relationships
# if TYPE_CHECKING:
#     from .note import Note

class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True) # Foreign Key to User
    name: str
    color: str = Field(default="#000000")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # notes: List["Note"] = Relationship(back_populates="category")
