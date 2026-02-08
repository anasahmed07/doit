"""add_title_to_note

Revision ID: a1b2c3d4e5f6
Revises: dcf69ad36077
Create Date: 2026-02-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'dcf69ad36077'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add optional title column to note table."""
    op.add_column('note', sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=True))


def downgrade() -> None:
    """Remove title column from note table."""
    op.drop_column('note', 'title')
