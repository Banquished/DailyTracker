"""todos

Revision ID: 002
Revises: 001
Create Date: 2026-03-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "todos",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("title", sqlmodel.AutoString(), nullable=False),
        sa.Column("description", sqlmodel.AutoString(), nullable=True),
        sa.Column(
            "recurrence",
            sa.Enum("none", "daily", "weekly", "monthly", name="recurrencetype"),
            nullable=False,
            server_default="none",
        ),
        sa.Column("rollover", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_todos_user_id"), "todos", ["user_id"], unique=False)

    op.create_table(
        "todo_occurrences",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("todo_id", sa.Uuid(), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("missed", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["todo_id"], ["todos.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_todo_occurrences_todo_id"),
        "todo_occurrences",
        ["todo_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_todo_occurrences_todo_id"), table_name="todo_occurrences")
    op.drop_table("todo_occurrences")
    op.drop_index(op.f("ix_todos_user_id"), table_name="todos")
    op.drop_table("todos")
    op.execute("DROP TYPE IF EXISTS recurrencetype")
