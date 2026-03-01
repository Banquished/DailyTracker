import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlmodel import Field, SQLModel


class WeightEntry(SQLModel, table=True):
    __tablename__ = "weight_entries"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    date: date
    weight_kg: Decimal = Field(max_digits=5, decimal_places=2)


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class WeightEntryCreate(SQLModel):
    date: date
    weight_kg: Decimal


class WeightEntryRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    weight_kg: Decimal
