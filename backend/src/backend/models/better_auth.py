from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from typing import Optional
import uuid
from datetime import datetime

class Session(SQLModel, table=True):
    __tablename__ = "session"

    id: uuid.UUID = Field(primary_key=True)
    token: str = Field(index=True)
    # Explicit column names to match Better Auth's camelCase convention
    userId: uuid.UUID = Field(sa_column=Column("userId", PG_UUID(as_uuid=True), index=True))
    expiresAt: datetime = Field(sa_column=Column("expiresAt", DateTime(timezone=True)))
    # Other fields exist but we only need these for validation
