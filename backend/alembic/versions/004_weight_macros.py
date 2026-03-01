"""weight and macros

Revision ID: 004
Revises: 003
Create Date: 2026-03-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "weight_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("weight_kg", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_weight_entries_user_id"),
        "weight_entries",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_weight_entries_date"),
        "weight_entries",
        ["date"],
        unique=False,
    )

    op.create_table(
        "macro_profiles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("calories", sa.Integer(), nullable=False, server_default="2000"),
        sa.Column("protein_g", sa.Integer(), nullable=False, server_default="150"),
        sa.Column("carbs_g", sa.Integer(), nullable=False, server_default="200"),
        sa.Column("fat_g", sa.Integer(), nullable=False, server_default="65"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_macro_profiles_user_id"),
    )
    op.create_index(
        op.f("ix_macro_profiles_user_id"),
        "macro_profiles",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_macro_profiles_user_id"), table_name="macro_profiles")
    op.drop_table("macro_profiles")
    op.drop_index(op.f("ix_weight_entries_date"), table_name="weight_entries")
    op.drop_index(op.f("ix_weight_entries_user_id"), table_name="weight_entries")
    op.drop_table("weight_entries")
