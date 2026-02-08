import ssl

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from mcp_service.config import settings

# asyncpg needs ssl passed via connect_args, not as a query parameter
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    connect_args={"ssl": ssl_context},
)

async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    async with async_session_factory() as session:
        yield session
