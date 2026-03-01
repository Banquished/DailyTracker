import uuid
from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class MealSlot(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"


# ---------------------------------------------------------------------------
# Table models
# ---------------------------------------------------------------------------


class Food(SQLModel, table=True):
    __tablename__ = "foods"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(index=True)
    calories_per_100g: Decimal = Field(max_digits=6, decimal_places=2)
    protein_g: Decimal = Field(max_digits=5, decimal_places=2)  # per 100g
    carbs_g: Decimal = Field(max_digits=5, decimal_places=2)    # per 100g
    fat_g: Decimal = Field(max_digits=5, decimal_places=2)      # per 100g

    meal_entries: list["MealPlanEntry"] = Relationship(back_populates="food")


class MealPlanEntry(SQLModel, table=True):
    __tablename__ = "meal_plan_entries"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    date: date
    meal_slot: MealSlot
    food_id: uuid.UUID = Field(foreign_key="foods.id")
    grams: Decimal = Field(max_digits=6, decimal_places=1)
    notes: Optional[str] = None

    food: Optional[Food] = Relationship(back_populates="meal_entries")


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class FoodCreate(SQLModel):
    name: str
    calories_per_100g: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal


class FoodRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    calories_per_100g: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal


class MealPlanEntryCreate(SQLModel):
    food_id: uuid.UUID
    grams: Decimal
    notes: Optional[str] = None


class MealPlanEntryRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    meal_slot: MealSlot
    food_id: uuid.UUID
    grams: Decimal
    notes: Optional[str]
    food: Optional[FoodRead] = None
