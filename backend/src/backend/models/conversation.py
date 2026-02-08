from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import uuid
from datetime import datetime


class Conversation(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Message(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversation.id", index=True)
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Optional[Conversation] = Relationship(back_populates="messages")
