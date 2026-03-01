"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel

from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _create_enum(name: str, *values: str) -> None:
    """Create a PostgreSQL enum type, ignoring duplicate_object errors.

    checkfirst=True on sa.Enum is unreliable with asyncpg; a DO block is
    the only safe way to make this idempotent against crash-resume scenarios.
    """
    quoted = ", ".join(f"'{v}'" for v in values)
    op.execute(sa.text(f"""
        DO $$ BEGIN
            CREATE TYPE {name} AS ENUM ({quoted});
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))


def upgrade() -> None:
    # ------------------------------------------------------------------
    # Enum types
    # ------------------------------------------------------------------
    _create_enum("recurrencetype", "none", "daily", "weekly", "monthly")
    _create_enum("habittype", "binary", "count")
    _create_enum("habitrecurrence", "daily", "weekly", "monthly")
    _create_enum("mealslot", "breakfast", "lunch", "dinner", "snack")

    # ------------------------------------------------------------------
    # users
    # ------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sqlmodel.AutoString(), nullable=False),
        sa.Column("hashed_password", sqlmodel.AutoString(), nullable=False),
        sa.Column("name", sqlmodel.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # ------------------------------------------------------------------
    # todos + todo_occurrences
    # ------------------------------------------------------------------
    op.create_table(
        "todos",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("title", sqlmodel.AutoString(), nullable=False),
        sa.Column("description", sqlmodel.AutoString(), nullable=True),
        sa.Column(
            "recurrence",
            sa.Enum(name="recurrencetype", create_type=False),
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
        op.f("ix_todo_occurrences_todo_id"), "todo_occurrences", ["todo_id"], unique=False
    )

    # ------------------------------------------------------------------
    # habits + habit_logs
    # ------------------------------------------------------------------
    op.create_table(
        "habits",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sqlmodel.AutoString(), nullable=False),
        sa.Column(
            "type",
            sa.Enum(name="habittype", create_type=False),
            nullable=False,
            server_default="binary",
        ),
        sa.Column("target_count", sa.Integer(), nullable=True),
        sa.Column(
            "recurrence",
            sa.Enum(name="habitrecurrence", create_type=False),
            nullable=False,
            server_default="daily",
        ),
        sa.Column("color", sqlmodel.AutoString(), nullable=False, server_default="#2563eb"),
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
        op.f("ix_habit_logs_habit_id"), "habit_logs", ["habit_id"], unique=False
    )

    # ------------------------------------------------------------------
    # weight_entries
    # ------------------------------------------------------------------
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
        op.f("ix_weight_entries_user_id"), "weight_entries", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_weight_entries_date"), "weight_entries", ["date"], unique=False
    )

    # ------------------------------------------------------------------
    # macro_profiles
    # ------------------------------------------------------------------
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
        op.f("ix_macro_profiles_user_id"), "macro_profiles", ["user_id"], unique=False
    )

    # ------------------------------------------------------------------
    # foods + meal_plan_entries
    # ------------------------------------------------------------------
    op.create_table(
        "foods",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("calories_per_100g", sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column("protein_g", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("carbs_g", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("fat_g", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_foods_user_id"), "foods", ["user_id"], unique=False)
    op.create_index(op.f("ix_foods_name"), "foods", ["name"], unique=False)

    op.create_table(
        "meal_plan_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column(
            "meal_slot",
            sa.Enum(name="mealslot", create_type=False),
            nullable=False,
        ),
        sa.Column("food_id", sa.Uuid(), nullable=False),
        sa.Column("grams", sa.Numeric(precision=6, scale=1), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["food_id"], ["foods.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_meal_plan_entries_user_id"), "meal_plan_entries", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_meal_plan_entries_date"), "meal_plan_entries", ["date"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_meal_plan_entries_date"), table_name="meal_plan_entries")
    op.drop_index(op.f("ix_meal_plan_entries_user_id"), table_name="meal_plan_entries")
    op.drop_table("meal_plan_entries")
    op.drop_index(op.f("ix_foods_name"), table_name="foods")
    op.drop_index(op.f("ix_foods_user_id"), table_name="foods")
    op.drop_table("foods")
    op.drop_index(op.f("ix_macro_profiles_user_id"), table_name="macro_profiles")
    op.drop_table("macro_profiles")
    op.drop_index(op.f("ix_weight_entries_date"), table_name="weight_entries")
    op.drop_index(op.f("ix_weight_entries_user_id"), table_name="weight_entries")
    op.drop_table("weight_entries")
    op.drop_index(op.f("ix_habit_logs_habit_id"), table_name="habit_logs")
    op.drop_table("habit_logs")
    op.drop_index(op.f("ix_habits_user_id"), table_name="habits")
    op.drop_table("habits")
    op.drop_index(op.f("ix_todo_occurrences_todo_id"), table_name="todo_occurrences")
    op.drop_table("todo_occurrences")
    op.drop_index(op.f("ix_todos_user_id"), table_name="todos")
    op.drop_table("todos")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.execute(sa.text("DROP TYPE IF EXISTS mealslot"))
    op.execute(sa.text("DROP TYPE IF EXISTS habitrecurrence"))
    op.execute(sa.text("DROP TYPE IF EXISTS habittype"))
    op.execute(sa.text("DROP TYPE IF EXISTS recurrencetype"))
