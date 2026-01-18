from sqlmodel import SQLModel, create_engine
from typing import Generator
from backend.core.config import settings

# Use Environment Variable for DB URL, default to local dev DB
DATABASE_URL = settings.DATABASE_URL

# Ensure we use psycopg for async/sync compatibility if needed, but standard create_engine works for sync
# For Neon, "sslmode=require" might be needed in prod
engine = create_engine(DATABASE_URL, echo=True)

def get_session() -> Generator:
    from sqlmodel import Session
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
