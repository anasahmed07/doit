from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from mcp_service.config import settings

engine = create_async_engine(settings.async_database_url, echo=False)

async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    async with async_session_factory() as session:
        yield session
