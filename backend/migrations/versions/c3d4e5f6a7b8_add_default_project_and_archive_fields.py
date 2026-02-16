"""add default project and archive fields

Revision ID: c3d4e5f6a7b8
Revises: 97ca865fc353
Create Date: 2026-02-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = '97ca865fc353'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add is_default to project, is_archived and archived_at to project_task."""
    op.add_column('project', sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('project_task', sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('project_task', sa.Column('archived_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Remove is_default, is_archived, archived_at columns."""
    op.drop_column('project_task', 'archived_at')
    op.drop_column('project_task', 'is_archived')
    op.drop_column('project', 'is_default')
