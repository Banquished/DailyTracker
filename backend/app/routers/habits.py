import uuid
from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.core.deps import CurrentUserIdDep, SessionDep
from app.models.habit import (
    Habit,
    HabitCreate,
    HabitLog,
    HabitLogCreate,
    HabitLogRead,
    HabitRead,
    HabitUpdate,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _habit_read(habit: Habit, logs: list[HabitLog]) -> HabitRead:
    """Build the HabitRead response schema from ORM objects."""
    return HabitRead(
        id=habit.id,
        user_id=habit.user_id,
        name=habit.name,
        type=habit.type,
        target_count=habit.target_count,
        recurrence=habit.recurrence,
        color=habit.color,
        active=habit.active,
        created_at=habit.created_at,
        logs=[
            HabitLogRead(
                id=log.id,
                habit_id=log.habit_id,
                date=log.date,
                completed=log.completed,
                count=log.count,
            )
            for log in logs
        ],
    )


def _log_read(log: HabitLog) -> HabitLogRead:
    return HabitLogRead(
        id=log.id,
        habit_id=log.habit_id,
        date=log.date,
        completed=log.completed,
        count=log.count,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("", response_model=list[HabitRead])
async def list_habits(
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> list[HabitRead]:
    """Return all active habits for the current user with logs from the past 365 days."""
    user_uuid = uuid.UUID(current_user_id)
    cutoff = date.today() - timedelta(days=365)

    result = await session.exec(
        select(Habit).where(Habit.user_id == user_uuid, Habit.active == True)  # noqa: E712
    )
    habits = result.all()

    response: list[HabitRead] = []
    for habit in habits:
        logs_result = await session.exec(
            select(HabitLog).where(
                HabitLog.habit_id == habit.id,
                HabitLog.date >= cutoff,
            )
        )
        logs = list(logs_result.all())
        response.append(_habit_read(habit, logs))

    return response


@router.post("", response_model=HabitRead, status_code=status.HTTP_201_CREATED)
async def create_habit(
    body: HabitCreate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> HabitRead:
    """Create a new habit for the current user."""
    user_uuid = uuid.UUID(current_user_id)

    habit = Habit(
        user_id=user_uuid,
        name=body.name,
        type=body.type,
        target_count=body.target_count,
        recurrence=body.recurrence,
        color=body.color,
    )
    session.add(habit)
    await session.commit()
    await session.refresh(habit)

    return _habit_read(habit, [])


@router.patch("/{habit_id}", response_model=HabitRead)
async def update_habit(
    habit_id: uuid.UUID,
    body: HabitUpdate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> HabitRead:
    """Update a habit's mutable fields.  Ownership is verified."""
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_uuid)
    )
    habit = result.first()
    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(habit, field, value)

    session.add(habit)
    await session.commit()
    await session.refresh(habit)

    cutoff = date.today() - timedelta(days=365)
    logs_result = await session.exec(
        select(HabitLog).where(
            HabitLog.habit_id == habit.id,
            HabitLog.date >= cutoff,
        )
    )
    logs = list(logs_result.all())
    return _habit_read(habit, logs)


@router.delete("/{habit_id}", response_model=dict)
async def delete_habit(
    habit_id: uuid.UUID,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> dict[str, bool]:
    """Soft-delete a habit by setting active=False.  Ownership is verified."""
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_uuid)
    )
    habit = result.first()
    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    habit.active = False
    session.add(habit)
    await session.commit()
    return {"ok": True}


@router.post("/{habit_id}/logs", response_model=HabitLogRead, status_code=status.HTTP_201_CREATED)
async def upsert_habit_log(
    habit_id: uuid.UUID,
    body: HabitLogCreate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> HabitLogRead:
    """
    Upsert a log entry for a given date.
    If a log already exists for that date, update it; otherwise create a new one.
    Ownership of the parent habit is verified.
    """
    user_uuid = uuid.UUID(current_user_id)

    # Verify habit belongs to current user
    habit_result = await session.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_uuid)
    )
    habit = habit_result.first()
    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    # Check for existing log on the same date (upsert logic)
    existing_result = await session.exec(
        select(HabitLog).where(
            HabitLog.habit_id == habit_id,
            HabitLog.date == body.date,
        )
    )
    log = existing_result.first()

    if log is not None:
        log.completed = body.completed
        log.count = body.count
    else:
        log = HabitLog(
            habit_id=habit_id,
            date=body.date,
            completed=body.completed,
            count=body.count,
        )

    session.add(log)
    await session.commit()
    await session.refresh(log)

    return _log_read(log)


@router.delete("/{habit_id}/logs/{log_id}", response_model=dict)
async def delete_habit_log(
    habit_id: uuid.UUID,
    log_id: uuid.UUID,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> dict[str, bool]:
    """
    Delete a specific habit log.
    Ownership chain (user -> habit -> log) is verified before deletion.
    """
    user_uuid = uuid.UUID(current_user_id)

    # Verify habit belongs to current user
    habit_result = await session.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_uuid)
    )
    habit = habit_result.first()
    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    # Fetch the log and confirm it belongs to the verified habit
    log_result = await session.exec(
        select(HabitLog).where(
            HabitLog.id == log_id,
            HabitLog.habit_id == habit_id,
        )
    )
    log = log_result.first()
    if log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit log not found",
        )

    await session.delete(log)
    await session.commit()
    return {"ok": True}
