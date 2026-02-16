from sqlmodel import Session, select
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from backend.models.notification import Notification
from backend.models.project import Project, ProjectTask


class NotificationService:
    def __init__(self, session: Session):
        self.session = session

    def create_notification(
        self,
        user_id: uuid.UUID,
        type: str,
        title: str,
        message: str,
        reference_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            reference_id=reference_id,
        )
        self.session.add(notification)
        self.session.commit()
        self.session.refresh(notification)
        return notification

    def get_notifications(
        self, user_id: uuid.UUID, unread_only: bool = False
    ) -> List[Notification]:
        statement = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            statement = statement.where(Notification.is_read == False)
        statement = statement.order_by(Notification.created_at.desc())
        return self.session.exec(statement).all()

    def get_unread_count(self, user_id: uuid.UUID) -> int:
        statement = select(Notification).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
        return len(self.session.exec(statement).all())

    def mark_as_read(self, notification_id: uuid.UUID) -> Optional[Notification]:
        notification = self.session.get(Notification, notification_id)
        if not notification:
            return None
        notification.is_read = True
        self.session.add(notification)
        self.session.commit()
        self.session.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: uuid.UUID) -> int:
        statement = select(Notification).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
        notifications = self.session.exec(statement).all()
        count = len(notifications)
        for n in notifications:
            n.is_read = True
            self.session.add(n)
        self.session.commit()
        return count

    def delete_notification(self, notification_id: uuid.UUID) -> bool:
        notification = self.session.get(Notification, notification_id)
        if not notification:
            return False
        self.session.delete(notification)
        self.session.commit()
        return True

    def generate_due_date_notifications(self, user_id: uuid.UUID) -> None:
        """Auto-generate overdue and due_soon notifications for the user's tasks."""
        now = datetime.utcnow()
        soon_threshold = now + timedelta(hours=24)

        # Get all projects owned by this user
        projects = self.session.exec(
            select(Project).where(Project.user_id == user_id)
        ).all()
        project_ids = [p.id for p in projects]
        if not project_ids:
            return

        # Get non-archived tasks with due dates from user's projects
        tasks = self.session.exec(
            select(ProjectTask).where(
                ProjectTask.project_id.in_(project_ids),
                ProjectTask.is_archived == False,
                ProjectTask.due_date != None,
                ProjectTask.status != "DONE",
            )
        ).all()

        # Get existing due-date notification reference_ids for dedup
        existing = self.session.exec(
            select(Notification.reference_id, Notification.type).where(
                Notification.user_id == user_id,
                Notification.type.in_(["overdue", "due_soon"]),
            )
        ).all()
        existing_keys = {(str(ref_id), ntype) for ref_id, ntype in existing}

        for task in tasks:
            task_key_overdue = (str(task.id), "overdue")
            task_key_due_soon = (str(task.id), "due_soon")

            if task.due_date < now and task_key_overdue not in existing_keys:
                self.create_notification(
                    user_id=user_id,
                    type="overdue",
                    title="Task overdue",
                    message=f'"{task.content}" is past its due date.',
                    reference_id=task.id,
                )
            elif now <= task.due_date <= soon_threshold and task_key_due_soon not in existing_keys:
                self.create_notification(
                    user_id=user_id,
                    type="due_soon",
                    title="Task due soon",
                    message=f'"{task.content}" is due within 24 hours.',
                    reference_id=task.id,
                )
