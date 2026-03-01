"""habits

Revision ID: 003
Revises: 002
Create Date: 2026-03-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "habits",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sqlmodel.AutoString(), nullable=False),
        sa.Column(
            "type",
            sa.Enum("binary", "count", name="habittype"),
            nullable=False,
            server_default="binary",
        ),
        sa.Column("target_count", sa.Integer(), nullable=True),
        sa.Column(
            "recurrence",
            sa.Enum("daily", "weekly", "monthly", name="habitrecurrence"),
            nullable=False,
            server_default="daily",
        ),
        sa.Column(
            "color",
            sqlmodel.AutoString(),
            nullable=False,
            server_default="#2563eb",
        ),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_habits_user_id"), "habits", ["user_id"], unique=False)

    op.create_table(
        "habit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("habit_id", sa.Uuid(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("count", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["habit_id"], ["habits.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_habit_logs_habit_id"),
        "habit_logs",
        ["habit_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_habit_logs_habit_id"), table_name="habit_logs")
    op.drop_table("habit_logs")
    op.drop_index(op.f("ix_habits_user_id"), table_name="habits")
    op.drop_table("habits")
    op.execute("DROP TYPE IF EXISTS habittype")
    op.execute("DROP TYPE IF EXISTS habitrecurrence")
