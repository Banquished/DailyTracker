import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    name: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class UserCreate(SQLModel):
    email: str
    name: str
    password: str


class UserRead(SQLModel):
    id: uuid.UUID
    email: str
    name: str
    created_at: datetime


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
