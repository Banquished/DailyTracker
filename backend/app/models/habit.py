import uuid
from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class HabitType(str, Enum):
    binary = "binary"
    count = "count"


class HabitRecurrence(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


# ---------------------------------------------------------------------------
# Table models
# ---------------------------------------------------------------------------


class Habit(SQLModel, table=True):
    __tablename__ = "habits"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str
    type: HabitType = HabitType.binary
    target_count: Optional[int] = None  # only for count-type
    recurrence: HabitRecurrence = HabitRecurrence.daily
    color: str = "#2563eb"  # hex color for commit grid
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    logs: list["HabitLog"] = Relationship(back_populates="habit")


class HabitLog(SQLModel, table=True):
    __tablename__ = "habit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    habit_id: uuid.UUID = Field(foreign_key="habits.id", index=True)
    date: date
    completed: bool = True
    count: Optional[int] = None  # only for count-type

    habit: Optional[Habit] = Relationship(back_populates="logs")


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class HabitCreate(SQLModel):
    name: str
    type: HabitType = HabitType.binary
    target_count: Optional[int] = None
    recurrence: HabitRecurrence = HabitRecurrence.daily
    color: str = "#2563eb"


class HabitUpdate(SQLModel):
    name: Optional[str] = None
    type: Optional[HabitType] = None
    target_count: Optional[int] = None
    recurrence: Optional[HabitRecurrence] = None
    color: Optional[str] = None
    active: Optional[bool] = None


class HabitLogCreate(SQLModel):
    date: date
    completed: bool = True
    count: Optional[int] = None


class HabitLogRead(SQLModel):
    id: uuid.UUID
    habit_id: uuid.UUID
    date: date
    completed: bool
    count: Optional[int]


class HabitRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    type: HabitType
    target_count: Optional[int]
    recurrence: HabitRecurrence
    color: str
    active: bool
    created_at: datetime
    logs: list[HabitLogRead] = []
