from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from backend.core.database import get_session
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.category import Category
from backend.services.category_service import CategoryService
import uuid
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response to separate from DB models
class CategoryCreate(BaseModel):
    name: str
    color: str = "#000000"

class CategoryRead(BaseModel):
    id: uuid.UUID
    name: str
    color: str

@router.get("/", response_model=List[CategoryRead])
def read_categories(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = CategoryService(session)
    return service.get_categories(current_user.id)

@router.post("/", response_model=CategoryRead)
def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = CategoryService(session)
    category = Category(
        name=category_in.name,
        color=category_in.color,
        user_id=current_user.id
    )
    return service.create_category(category)
