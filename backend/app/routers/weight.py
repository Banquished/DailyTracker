import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
from sqlmodel import select

from app.core.deps import CurrentUserIdDep, SessionDep
from app.models.weight import WeightEntry, WeightEntryCreate, WeightEntryRead

router = APIRouter()


def _entry_read(entry: WeightEntry) -> WeightEntryRead:
    """Build the WeightEntryRead response schema from an ORM object."""
    return WeightEntryRead(
        id=entry.id,
        user_id=entry.user_id,
        date=entry.date,
        weight_kg=entry.weight_kg,
    )


@router.get("", response_model=list[WeightEntryRead])
async def list_weight_entries(
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
) -> list[WeightEntryRead]:
    """Return weight entries for the current user, optionally filtered by date range."""
    user_uuid = uuid.UUID(current_user_id)

    query = select(WeightEntry).where(WeightEntry.user_id == user_uuid)

    if start_date is not None:
        query = query.where(WeightEntry.date >= start_date)
    if end_date is not None:
        query = query.where(WeightEntry.date <= end_date)

    query = query.order_by(WeightEntry.date)

    result = await session.exec(query)
    entries = result.all()

    return [_entry_read(e) for e in entries]


@router.post("", response_model=WeightEntryRead, status_code=status.HTTP_201_CREATED)
async def create_weight_entry(
    body: WeightEntryCreate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> WeightEntryRead:
    """Create a new weight entry for the current user."""
    user_uuid = uuid.UUID(current_user_id)

    entry = WeightEntry(
        user_id=user_uuid,
        date=body.date,
        weight_kg=body.weight_kg,
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    return _entry_read(entry)


@router.delete("/{entry_id}", response_model=dict)
async def delete_weight_entry(
    entry_id: uuid.UUID,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> dict[str, bool]:
    """Hard-delete a weight entry.  Ownership is verified."""
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(WeightEntry).where(
            WeightEntry.id == entry_id,
            WeightEntry.user_id == user_uuid,
        )
    )
    entry = result.first()
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight entry not found",
        )

    await session.delete(entry)
    await session.commit()
    return {"ok": True}
