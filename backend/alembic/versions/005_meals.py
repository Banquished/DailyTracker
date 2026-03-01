"""meals: foods and meal_plan_entries

Revision ID: 005
Revises: 004
Create Date: 2026-03-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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

    # Create enum idempotently — checkfirst=True on sa.Enum is unreliable with asyncpg
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE mealslot AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))

    op.create_table(
        "meal_plan_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column(
            "meal_slot",
            sa.Enum("breakfast", "lunch", "dinner", "snack", name="mealslot", create_type=False),
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
        op.f("ix_meal_plan_entries_user_id"),
        "meal_plan_entries",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_meal_plan_entries_date"),
        "meal_plan_entries",
        ["date"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_meal_plan_entries_date"), table_name="meal_plan_entries")
    op.drop_index(op.f("ix_meal_plan_entries_user_id"), table_name="meal_plan_entries")
    op.drop_table("meal_plan_entries")
    op.execute(sa.text("DROP TYPE IF EXISTS mealslot"))
    op.drop_index(op.f("ix_foods_name"), table_name="foods")
    op.drop_index(op.f("ix_foods_user_id"), table_name="foods")
    op.drop_table("foods")
