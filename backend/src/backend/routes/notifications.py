from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List, Optional
from backend.core.database import get_session
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.notification import Notification
from backend.services.notification_service import NotificationService
import uuid
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class NotificationRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: str
    title: str
    message: str
    reference_id: Optional[uuid.UUID] = None
    is_read: bool
    created_at: datetime


@router.get("/", response_model=List[NotificationRead])
def read_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = NotificationService(session)
    service.generate_due_date_notifications(current_user.id)
    return service.get_notifications(current_user.id, unread_only=unread_only)


@router.get("/unread-count")
def unread_count(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = NotificationService(session)
    service.generate_due_date_notifications(current_user.id)
    return {"count": service.get_unread_count(current_user.id)}


@router.patch("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = NotificationService(session)
    count = service.mark_all_as_read(current_user.id)
    return {"count": count}


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = NotificationService(session)
    notification = service.mark_as_read(notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = NotificationService(session)
    # Verify ownership before deleting
    notification = session.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    service.delete_notification(notification_id)
    return {"ok": True}
