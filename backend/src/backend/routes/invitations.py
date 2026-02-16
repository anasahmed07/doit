from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List, Optional
from backend.core.database import get_session
from backend.core.security import get_current_user
from backend.models.user import User
from backend.services.invitation_service import InvitationService
import uuid
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class InviteRequest(BaseModel):
    project_id: uuid.UUID
    email: str


class InvitationRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    inviter_id: uuid.UUID
    invitee_id: uuid.UUID
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    project_name: Optional[str] = None
    inviter_name: Optional[str] = None
    invitee_name: Optional[str] = None
    invitee_email: Optional[str] = None


class MemberRead(BaseModel):
    id: str
    project_id: str
    user_id: str
    role: str
    joined_at: str
    user_name: str
    user_email: str
    user_image: Optional[str] = None


def _enrich_invitation(invitation, session: Session) -> dict:
    from backend.models.project import Project

    project = session.get(Project, invitation.project_id)
    inviter = session.get(User, invitation.inviter_id)
    invitee = session.get(User, invitation.invitee_id)
    return {
        "id": invitation.id,
        "project_id": invitation.project_id,
        "inviter_id": invitation.inviter_id,
        "invitee_id": invitation.invitee_id,
        "status": invitation.status,
        "created_at": invitation.created_at,
        "resolved_at": invitation.resolved_at,
        "project_name": project.name if project else None,
        "inviter_name": (inviter.name or inviter.email) if inviter else None,
        "invitee_name": (invitee.name or invitee.email) if invitee else None,
        "invitee_email": invitee.email if invitee else None,
    }


@router.post("/", response_model=InvitationRead)
def create_invitation(
    body: InviteRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = InvitationService(session)
    try:
        invitation = service.invite_user_by_email(
            body.project_id, current_user.id, body.email
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    return _enrich_invitation(invitation, session)


@router.get("/pending", response_model=List[InvitationRead])
def get_pending(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = InvitationService(session)
    invitations = service.get_pending_invitations(current_user.id)
    return [_enrich_invitation(inv, session) for inv in invitations]


@router.get("/project/{project_id}", response_model=List[InvitationRead])
def get_project_invitations(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    from backend.models.project import Project

    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    service = InvitationService(session)
    invitations = service.get_project_invitations(project_id)
    return [_enrich_invitation(inv, session) for inv in invitations]


@router.patch("/{invitation_id}/accept", response_model=InvitationRead)
def accept_invitation(
    invitation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = InvitationService(session)
    try:
        invitation = service.accept_invitation(invitation_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    return _enrich_invitation(invitation, session)


@router.patch("/{invitation_id}/decline", response_model=InvitationRead)
def decline_invitation(
    invitation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = InvitationService(session)
    try:
        invitation = service.decline_invitation(invitation_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    return _enrich_invitation(invitation, session)


@router.delete("/{invitation_id}")
def cancel_invitation(
    invitation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = InvitationService(session)
    try:
        service.cancel_invitation(invitation_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    return {"ok": True}


@router.get("/project/{project_id}/members", response_model=List[MemberRead])
def get_members(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = InvitationService(session)
    return service.get_project_members(project_id)


@router.delete("/project/{project_id}/members/{user_id}")
def remove_member(
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = InvitationService(session)
    try:
        service.remove_member(project_id, user_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    return {"ok": True}
