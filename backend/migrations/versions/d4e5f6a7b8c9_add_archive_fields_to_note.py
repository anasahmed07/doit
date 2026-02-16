"""add archive fields to note

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-02-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add is_archived and archived_at to note."""
    op.add_column('note', sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('note', sa.Column('archived_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Remove is_archived, archived_at columns from note."""
    op.drop_column('note', 'archived_at')
    op.drop_column('note', 'is_archived')
