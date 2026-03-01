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

meal_slot_enum = sa.Enum(
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    name="mealslot",
)


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

    meal_slot_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "meal_plan_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("meal_slot", meal_slot_enum, nullable=False),
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
    meal_slot_enum.drop(op.get_bind(), checkfirst=True)
    op.drop_index(op.f("ix_foods_name"), table_name="foods")
    op.drop_index(op.f("ix_foods_user_id"), table_name="foods")
    op.drop_table("foods")
