from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie
from sqlmodel import Session as DbSession, select
from backend.core.database import get_session
from backend.core.config import settings
from backend.models.user import User
from backend.models.better_auth import Session
from datetime import datetime

oauth2_scheme = APIKeyCookie(name="better-auth.session_token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: DbSession = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Lookup session in DB
    statement = select(Session).where(Session.token == token)
    result = session.exec(statement)
    db_session = result.first()

    if not db_session:
        raise credentials_exception

    # 2. Check expiration
    if db_session.expiresAt < datetime.utcnow():
        raise credentials_exception

    # 3. Get User
    user = session.get(User, db_session.userId)
    if user is None:
        raise credentials_exception

    return user
