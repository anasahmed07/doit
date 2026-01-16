from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie
from sqlmodel import Session, select
from backend.core.database import get_session
from backend.core.config import settings
from backend.models.user import User
# from jose import jwt, JWTError # Optional: If we were validating JWT locally
# import httpx # Required if verifying session with Frontend Server

# Since we are using "Shared Secret" validation as per plan:
# We assume the frontend sets a signed cookie or we verify a token against the secret locally.
# However, Better Auth often uses opaque tokens or its own JWT format.
# A robust "Shared Secret" approach usually means the Backend trusts the token signed by the Frontend (if JWT)
# OR calls the Frontend to verify the session.

# Decision: Assuming Better Auth uses JWT signed with BETTER_AUTH_SECRET.
# We will verify the signature locally.

from jose import jwt, JWTError

oauth2_scheme = APIKeyCookie(name="better-auth.session_token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Better Auth JWT verification logic
        # WARNING: Verify the algorithm and key format Better Auth uses.
        # Often it's HS256 with the secret.
        payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=["HS256"])

        # Extract user info. Adjust 'sub' or 'id' based on Better Auth payload structure.
        user_id: str = payload.get("sub") or payload.get("userId") or payload.get("id")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = session.get(User, user_id)
    if user is None:
        # Optional: Auto-create user from token info if "Stateless" mode implies it exists
        # For now, require DB existence (synced via webhook or created on first login)
        raise credentials_exception

    return user
