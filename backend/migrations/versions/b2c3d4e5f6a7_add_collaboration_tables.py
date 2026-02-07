"""add_collaboration_tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add project_member, project_invitation, notification tables and assignee_id column."""
    # Add assignee_id to project_task
    op.add_column('project_task', sa.Column('assignee_id', sa.Uuid(), nullable=True))
    op.create_index('ix_project_task_assignee_id', 'project_task', ['assignee_id'])

    # Create project_member table
    op.create_table(
        'project_member',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('project_id', sa.Uuid(), sa.ForeignKey('project.id'), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='member'),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_project_member_project_id', 'project_member', ['project_id'])
    op.create_index('ix_project_member_user_id', 'project_member', ['user_id'])

    # Create project_invitation table
    op.create_table(
        'project_invitation',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('project_id', sa.Uuid(), sa.ForeignKey('project.id'), nullable=False),
        sa.Column('inviter_id', sa.Uuid(), nullable=False),
        sa.Column('invitee_id', sa.Uuid(), nullable=False),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_project_invitation_project_id', 'project_invitation', ['project_id'])
    op.create_index('ix_project_invitation_inviter_id', 'project_invitation', ['inviter_id'])
    op.create_index('ix_project_invitation_invitee_id', 'project_invitation', ['invitee_id'])

    # Create notification table
    op.create_table(
        'notification',
        sa.Column('id', sa.Uuid(), primary_key=True),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('message', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('reference_id', sa.Uuid(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_notification_user_id', 'notification', ['user_id'])


def downgrade() -> None:
    """Remove collaboration tables and assignee_id column."""
    op.drop_table('notification')
    op.drop_table('project_invitation')
    op.drop_table('project_member')
    op.drop_index('ix_project_task_assignee_id', 'project_task')
    op.drop_column('project_task', 'assignee_id')
