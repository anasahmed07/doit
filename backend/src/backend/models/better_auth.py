from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime

class Session(SQLModel, table=True):
    __tablename__ = "session"
    
    id: uuid.UUID = Field(primary_key=True)
    token: str = Field(index=True)
    userId: uuid.UUID = Field(index=True)
    expiresAt: datetime
    # Other fields exist but we only need these for validation
