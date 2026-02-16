from sqlmodel import Session, select
from typing import List, Optional
import uuid
from datetime import datetime
from backend.models.invitation import ProjectInvitation
from backend.models.project import Project, ProjectMember
from backend.models.user import User
from backend.models.notification import Notification


class InvitationService:
    def __init__(self, session: Session):
        self.session = session

    def invite_user_by_email(
        self, project_id: uuid.UUID, inviter_id: uuid.UUID, email: str
    ) -> ProjectInvitation:
        # Look up invitee by email
        invitee = self.session.exec(
            select(User).where(User.email == email)
        ).first()
        if not invitee:
            raise ValueError("No user found with that email address")

        # Can't invite yourself
        if invitee.id == inviter_id:
            raise ValueError("You cannot invite yourself")

        # Verify inviter is the project owner
        project = self.session.get(Project, project_id)
        if not project:
            raise ValueError("Project not found")
        if project.is_default:
            raise ValueError("Cannot invite members to the default project")
        if project.user_id != inviter_id:
            raise PermissionError("Only the project owner can send invitations")

        # Check if already a member
        existing_member = self.session.exec(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == invitee.id,
            )
        ).first()
        if existing_member:
            raise ValueError("This user is already a member of the project")

        # Check for duplicate pending invitation
        existing_invitation = self.session.exec(
            select(ProjectInvitation).where(
                ProjectInvitation.project_id == project_id,
                ProjectInvitation.invitee_id == invitee.id,
                ProjectInvitation.status == "pending",
            )
        ).first()
        if existing_invitation:
            raise ValueError("A pending invitation already exists for this user")

        # Create invitation
        invitation = ProjectInvitation(
            project_id=project_id,
            inviter_id=inviter_id,
            invitee_id=invitee.id,
        )
        self.session.add(invitation)
        self.session.commit()
        self.session.refresh(invitation)

        # Create notification for invitee
        inviter = self.session.get(User, inviter_id)
        inviter_name = inviter.name or inviter.email if inviter else "Someone"
        notification = Notification(
            user_id=invitee.id,
            type="project_invitation",
            title="Project Invitation",
            message=f'{inviter_name} invited you to join "{project.name}"',
            reference_id=invitation.id,
        )
        self.session.add(notification)
        self.session.commit()

        return invitation

    def get_pending_invitations(self, user_id: uuid.UUID) -> List[ProjectInvitation]:
        statement = (
            select(ProjectInvitation)
            .where(
                ProjectInvitation.invitee_id == user_id,
                ProjectInvitation.status == "pending",
            )
            .order_by(ProjectInvitation.created_at.desc())
        )
        return self.session.exec(statement).all()

    def get_project_invitations(
        self, project_id: uuid.UUID
    ) -> List[ProjectInvitation]:
        statement = (
            select(ProjectInvitation)
            .where(ProjectInvitation.project_id == project_id)
            .order_by(ProjectInvitation.created_at.desc())
        )
        return self.session.exec(statement).all()

    def accept_invitation(
        self, invitation_id: uuid.UUID, user_id: uuid.UUID
    ) -> ProjectInvitation:
        invitation = self.session.get(ProjectInvitation, invitation_id)
        if not invitation:
            raise ValueError("Invitation not found")
        if invitation.invitee_id != user_id:
            raise PermissionError("You can only accept your own invitations")
        if invitation.status != "pending":
            raise ValueError("This invitation is no longer pending")

        # Accept invitation
        invitation.status = "accepted"
        invitation.resolved_at = datetime.utcnow()
        self.session.add(invitation)

        # Create project member
        member = ProjectMember(
            project_id=invitation.project_id,
            user_id=user_id,
            role="member",
        )
        self.session.add(member)
        self.session.commit()
        self.session.refresh(invitation)

        # Notify the inviter
        invitee = self.session.get(User, user_id)
        project = self.session.get(Project, invitation.project_id)
        invitee_name = invitee.name or invitee.email if invitee else "Someone"
        project_name = project.name if project else "a project"
        notification = Notification(
            user_id=invitation.inviter_id,
            type="invitation_accepted",
            title="Invitation Accepted",
            message=f'{invitee_name} accepted your invitation to "{project_name}"',
            reference_id=invitation.id,
        )
        self.session.add(notification)
        self.session.commit()

        return invitation

    def decline_invitation(
        self, invitation_id: uuid.UUID, user_id: uuid.UUID
    ) -> ProjectInvitation:
        invitation = self.session.get(ProjectInvitation, invitation_id)
        if not invitation:
            raise ValueError("Invitation not found")
        if invitation.invitee_id != user_id:
            raise PermissionError("You can only decline your own invitations")
        if invitation.status != "pending":
            raise ValueError("This invitation is no longer pending")

        invitation.status = "declined"
        invitation.resolved_at = datetime.utcnow()
        self.session.add(invitation)
        self.session.commit()
        self.session.refresh(invitation)
        return invitation

    def cancel_invitation(
        self, invitation_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        invitation = self.session.get(ProjectInvitation, invitation_id)
        if not invitation:
            raise ValueError("Invitation not found")
        if invitation.inviter_id != user_id:
            raise PermissionError("Only the inviter can cancel an invitation")
        if invitation.status != "pending":
            raise ValueError("This invitation is no longer pending")

        self.session.delete(invitation)
        self.session.commit()
        return True

    def get_project_members(self, project_id: uuid.UUID) -> list:
        statement = select(ProjectMember, User).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == User.id,
        )
        results = self.session.exec(statement).all()
        members = []
        for member, user in results:
            members.append(
                {
                    "id": str(member.id),
                    "project_id": str(member.project_id),
                    "user_id": str(member.user_id),
                    "role": member.role,
                    "joined_at": member.joined_at.isoformat(),
                    "user_name": user.name or user.email,
                    "user_email": user.email,
                    "user_image": user.image,
                }
            )
        return members

    def remove_member(
        self,
        project_id: uuid.UUID,
        user_id: uuid.UUID,
        requester_id: uuid.UUID,
    ) -> bool:
        project = self.session.get(Project, project_id)
        if not project:
            raise ValueError("Project not found")
        if project.user_id != requester_id:
            raise PermissionError("Only the project owner can remove members")
        if user_id == project.user_id:
            raise ValueError("Cannot remove the project owner")

        member = self.session.exec(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id,
            )
        ).first()
        if not member:
            raise ValueError("Member not found")

        self.session.delete(member)
        self.session.commit()
        return True
