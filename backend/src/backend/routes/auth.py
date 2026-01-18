from fastapi import APIRouter, Depends
from backend.core.security import get_current_user
from backend.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user profile
    """
    return current_user
