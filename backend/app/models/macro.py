import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class MacroProfile(SQLModel, table=True):
    __tablename__ = "macro_profiles"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, index=True)
    calories: int = 2000
    protein_g: int = 150
    carbs_g: int = 200
    fat_g: int = 65
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class MacroProfileCreate(SQLModel):
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int


class MacroProfileRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    updated_at: datetime


class DailyMacros(SQLModel):
    """Computed daily macros from meal plan entries."""

    date: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
