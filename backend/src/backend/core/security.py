import logging

logging.basicConfig(filename='security.log', level=logging.INFO)

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session as DbSession
from backend.core.database import get_session
from backend.core.config import settings
from backend.models.user import User
from jose import JWTError, jwt
from pydantic import BaseModel

class TokenData(BaseModel):
    sub: str | None = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: DbSession = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=["HS256"])
        logging.info(f"Decoded JWT payload: {payload}")
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(sub=user_id)
    except JWTError:
        raise credentials_exception

    user = session.get(User, token_data.sub)
    if user is None:
        raise credentials_exception
    return user
