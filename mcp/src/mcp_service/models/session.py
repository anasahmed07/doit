from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from datetime import datetime


class Session(SQLModel, table=True):
    __tablename__ = "session"

    id: uuid.UUID = Field(primary_key=True)
    token: str = Field(index=True)
    userId: uuid.UUID = Field(sa_column=Column("userId", PG_UUID(as_uuid=True), index=True))
    expiresAt: datetime = Field(sa_column=Column("expiresAt", DateTime(timezone=True)))
