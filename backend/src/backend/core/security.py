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
        logging.warning("No token provided (neither Bearer header nor cookie)")
        raise credentials_exception

    logging.info(f"Received token (first 10 chars): {token[:10]}...")

    # 1. Try decoding as JWT (for dev/test tokens)
    try:
        payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=["HS256"])
        logging.info(f"Decoded JWT payload: {payload}")
        user_id: str | None = payload.get("sub")
        if user_id:
            user = session.get(User, user_id)
            if user:
                logging.info(f"User authenticated via JWT: {user.email}")
                return user
    except JWTError as e:
        logging.debug(f"Not a valid JWT: {e}")
        pass # Not a JWT, fall through to check session token

    # 2. Check if it's a Better Auth Session Token
    # Better Auth signs session tokens: "token.signature"
    # Extract the unsigned token (before the dot) for database lookup
    unsigned_token = token.split(".")[0] if "." in token else token
    logging.info(f"Attempting session token lookup in database (unsigned: {unsigned_token[:10]}...)")

    statement = select(UserSession).where(UserSession.token == unsigned_token)
    result = session.exec(statement).first()

    logging.info(f"Session lookup result: {result}")

    if result:
        # Check expiration
        # Note: Database stores naive or aware datetime depending on setup.
        # Better Auth usually uses UTC.
        # Ensure result.expiresAt is timezone-aware if possible, or compare naive
        now = datetime.now(result.expiresAt.tzinfo) if result.expiresAt.tzinfo else datetime.utcnow()

        logging.info(f"Session found. userId={result.userId}, expiresAt={result.expiresAt}, now={now}")

        if result.expiresAt > now:
            user = session.get(User, result.userId)
            logging.info(f"User lookup result: {user}")
            if user:
                logging.info(f"User authenticated via session token: {user.email}")
                return user
            else:
                logging.warning(f"Session valid but user not found for userId={result.userId}")
        else:
            logging.warning(f"Session expired: expiresAt={result.expiresAt} <= now={now}")
    else:
        logging.warning(f"No session found for token: {token[:10]}...")

    # If both fail
    logging.error("Authentication failed - no valid JWT or session token")
    raise credentials_exception
