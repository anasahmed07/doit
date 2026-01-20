import logging
from datetime import datetime

logging.basicConfig(filename='security.log', level=logging.INFO)

from fastapi import Depends, HTTPException, status, Cookie, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session as DbSession, select
from backend.core.database import get_session
from backend.core.config import settings
from backend.models.user import User
from backend.models.better_auth import Session as UserSession
from jose import JWTError, jwt
from pydantic import BaseModel

class TokenData(BaseModel):
    sub: str | None = None

# auto_error=False allows us to handle the missing header manually (fallback to cookie)
security = HTTPBearer(auto_error=False)

async def get_current_user(
    token_creds: HTTPAuthorizationCredentials | None = Security(security),
    session_token: str | None = Cookie(alias="better-auth.session_token", default=None),
    session: DbSession = Depends(get_session)
) -> User:
    
    token = None
    if token_creds:
        token = token_creds.credentials
    elif session_token:
        token = session_token
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    # 1. Try decoding as JWT (for dev/test tokens)
    try:
        payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=["HS256"])
        logging.info(f"Decoded JWT payload: {payload}")
        user_id: str | None = payload.get("sub")
        if user_id:
            user = session.get(User, user_id)
            if user:
                return user
    except JWTError:
        pass # Not a JWT, fall through to check session token

    # 2. Check if it's a Better Auth Session Token
    statement = select(UserSession).where(UserSession.token == token)
    result = session.exec(statement).first()
    
    if result:
        # Check expiration
        # Note: Database stores naive or aware datetime depending on setup.
        # Better Auth usually uses UTC.
        # Ensure result.expiresAt is timezone-aware if possible, or compare naive
        now = datetime.now(result.expiresAt.tzinfo) if result.expiresAt.tzinfo else datetime.utcnow()
        
        if result.expiresAt > now:
            user = session.get(User, result.userId)
            if user:
                return user
            
    # If both fail
    raise credentials_exception
