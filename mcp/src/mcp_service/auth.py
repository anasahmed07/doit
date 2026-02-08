import uuid
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mcp_service.models.session import Session
from mcp_service.models.user import User


async def validate_session_token(token: str, db: AsyncSession) -> uuid.UUID:
    """Validate a Better Auth session token and return the user_id.

    Better Auth signs tokens as "token.signature".
    We extract the unsigned portion for DB lookup.
    """
    unsigned_token = token.split(".")[0] if "." in token else token

    result = await db.execute(
        select(Session).where(Session.token == unsigned_token)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        )

    now = datetime.now(session.expiresAt.tzinfo) if session.expiresAt.tzinfo else datetime.utcnow()
    if session.expiresAt <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    return session.userId


async def get_user_by_id(user_id: uuid.UUID, db: AsyncSession) -> User:
    """Fetch a user by ID. Raises 401 if not found."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
