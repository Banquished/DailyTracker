import uuid
from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class RecurrenceType(str, Enum):
    none = "none"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


# ---------------------------------------------------------------------------
# Table models
# ---------------------------------------------------------------------------


class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    title: str
    description: Optional[str] = None
    recurrence: RecurrenceType = RecurrenceType.none
    rollover: bool = False
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    occurrences: list["TodoOccurrence"] = Relationship(back_populates="todo")


class TodoOccurrence(SQLModel, table=True):
    __tablename__ = "todo_occurrences"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    todo_id: uuid.UUID = Field(foreign_key="todos.id", index=True)
    due_date: date
    completed_at: Optional[datetime] = None
    missed: bool = False

    todo: Optional[Todo] = Relationship(back_populates="occurrences")


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class TodoCreate(SQLModel):
    title: str
    description: Optional[str] = None
    recurrence: RecurrenceType = RecurrenceType.none
    rollover: bool = False


class TodoUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    recurrence: Optional[RecurrenceType] = None
    rollover: Optional[bool] = None
    active: Optional[bool] = None


class TodoOccurrenceRead(SQLModel):
    id: uuid.UUID
    todo_id: uuid.UUID
    due_date: date
    completed_at: Optional[datetime]
    missed: bool


class TodoOccurrenceUpdate(SQLModel):
    completed: bool
    missed: Optional[bool] = None


class TodoRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    recurrence: RecurrenceType
    rollover: bool
    active: bool
    created_at: datetime
    occurrences: list[TodoOccurrenceRead] = []


# Alias — same shape, kept separate so callers can be explicit about intent
class TodoWithOccurrences(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    recurrence: RecurrenceType
    rollover: bool
    active: bool
    created_at: datetime
    occurrences: list[TodoOccurrenceRead] = []
