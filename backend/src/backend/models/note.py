from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import uuid
from datetime import datetime

class Note(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    category_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.id")
    content: Optional[str] = None # Text content (Markdown)
    order_index: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to MediaAsset
    media_assets: List["MediaAsset"] = Relationship(back_populates="note", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class MediaAsset(SQLModel, table=True):
    __tablename__ = "media_asset" # Explicit table name to avoid potential conflicts
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    note_id: uuid.UUID = Field(foreign_key="note.id")
    mime_type: str
    data: bytes # BLOB storage
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship back to Note
    note: Optional[Note] = Relationship(back_populates="media_assets")
