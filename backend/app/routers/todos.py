import uuid
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.core.deps import CurrentUserIdDep, SessionDep
from app.domain.recurrence import get_or_create_occurrences
from app.models.todo import (
    RecurrenceType,
    Todo,
    TodoCreate,
    TodoOccurrence,
    TodoOccurrenceRead,
    TodoOccurrenceUpdate,
    TodoRead,
    TodoUpdate,
    TodoWithOccurrences,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _todo_with_occurrences(
    todo: Todo,
    occurrences: list[TodoOccurrence],
) -> TodoWithOccurrences:
    """Build the response schema from ORM objects."""
    return TodoWithOccurrences(
        id=todo.id,
        user_id=todo.user_id,
        title=todo.title,
        description=todo.description,
        recurrence=todo.recurrence,
        rollover=todo.rollover,
        active=todo.active,
        created_at=todo.created_at,
        occurrences=[
            TodoOccurrenceRead(
                id=occ.id,
                todo_id=occ.todo_id,
                due_date=occ.due_date,
                completed_at=occ.completed_at,
                missed=occ.missed,
            )
            for occ in occurrences
        ],
    )


def _todo_read(todo: Todo, occurrences: list[TodoOccurrence]) -> TodoRead:
    return TodoRead(
        id=todo.id,
        user_id=todo.user_id,
        title=todo.title,
        description=todo.description,
        recurrence=todo.recurrence,
        rollover=todo.rollover,
        active=todo.active,
        created_at=todo.created_at,
        occurrences=[
            TodoOccurrenceRead(
                id=occ.id,
                todo_id=occ.todo_id,
                due_date=occ.due_date,
                completed_at=occ.completed_at,
                missed=occ.missed,
            )
            for occ in occurrences
        ],
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("", response_model=list[TodoWithOccurrences])
async def list_todos(
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[TodoWithOccurrences]:
    """
    Return all active todos for the current user, optionally filtered to a
    date window.  For recurring todos, any missing occurrences within the
    requested window are bulk-inserted before the response is built.
    """
    today = date.today()
    range_start = start_date or today
    range_end = end_date or today

    user_uuid = uuid.UUID(current_user_id)

    # 1. Fetch all active todos owned by the user
    result = await session.exec(
        select(Todo).where(Todo.user_id == user_uuid, Todo.active == True)  # noqa: E712
    )
    todos = result.all()

    response: list[TodoWithOccurrences] = []

    for todo in todos:
        # 2. Load ALL existing occurrences for this todo (needed for dedup logic)
        occ_result = await session.exec(
            select(TodoOccurrence).where(TodoOccurrence.todo_id == todo.id)
        )
        all_occurrences = list(occ_result.all())

        # 3. For recurring todos, create any missing occurrences in the window
        if todo.recurrence is not RecurrenceType.none:
            missing_dates = get_or_create_occurrences(
                recurrence=todo.recurrence,
                todo_created_at_date=todo.created_at.date(),
                existing_occurrences=all_occurrences,
                start_date=range_start,
                end_date=range_end,
            )
            for d in missing_dates:
                new_occ = TodoOccurrence(todo_id=todo.id, due_date=d)
                session.add(new_occ)
                all_occurrences.append(new_occ)

            if missing_dates:
                await session.commit()
                # Refresh newly added occurrences so they have DB-assigned ids
                for occ in all_occurrences:
                    if occ.id is None:  # type: ignore[comparison-overlap]
                        await session.refresh(occ)

        # 4. Filter occurrences to the requested window for the response
        window_occurrences = [
            occ
            for occ in all_occurrences
            if range_start <= occ.due_date <= range_end
        ]

        response.append(_todo_with_occurrences(todo, window_occurrences))

    return response


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
async def create_todo(
    body: TodoCreate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> TodoRead:
    """
    Create a new todo.  If recurrence is none, a single occurrence for today
    is created automatically so the todo is immediately actionable.
    """
    user_uuid = uuid.UUID(current_user_id)

    todo = Todo(
        user_id=user_uuid,
        title=body.title,
        description=body.description,
        recurrence=body.recurrence,
        rollover=body.rollover,
    )
    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    occurrences: list[TodoOccurrence] = []
    if body.recurrence is RecurrenceType.none:
        occ = TodoOccurrence(todo_id=todo.id, due_date=date.today())
        session.add(occ)
        await session.commit()
        await session.refresh(occ)
        occurrences.append(occ)

    return _todo_read(todo, occurrences)


@router.patch("/{todo_id}", response_model=TodoRead)
async def update_todo(
    todo_id: uuid.UUID,
    body: TodoUpdate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> TodoRead:
    """Update a todo's mutable fields.  Ownership is verified."""
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(Todo).where(Todo.id == todo_id, Todo.user_id == user_uuid)
    )
    todo = result.first()
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    # Return the todo with its existing occurrences unchanged
    occ_result = await session.exec(
        select(TodoOccurrence).where(TodoOccurrence.todo_id == todo.id)
    )
    occurrences = list(occ_result.all())
    return _todo_read(todo, occurrences)


@router.delete("/{todo_id}", response_model=dict)
async def delete_todo(
    todo_id: uuid.UUID,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> dict[str, bool]:
    """Soft-delete a todo by setting active=False.  Ownership is verified."""
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(Todo).where(Todo.id == todo_id, Todo.user_id == user_uuid)
    )
    todo = result.first()
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    todo.active = False
    session.add(todo)
    await session.commit()
    return {"ok": True}


@router.patch("/{todo_id}/occurrences/{occ_id}", response_model=TodoOccurrenceRead)
async def update_occurrence(
    todo_id: uuid.UUID,
    occ_id: uuid.UUID,
    body: TodoOccurrenceUpdate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> TodoOccurrenceRead:
    """
    Mark an occurrence as completed / uncompleted, or flag it as missed.
    Todo ownership is verified before the occurrence is mutated.
    """
    user_uuid = uuid.UUID(current_user_id)

    # Verify the todo belongs to the current user
    todo_result = await session.exec(
        select(Todo).where(Todo.id == todo_id, Todo.user_id == user_uuid)
    )
    todo = todo_result.first()
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    # Fetch the occurrence and confirm it belongs to the verified todo
    occ_result = await session.exec(
        select(TodoOccurrence).where(
            TodoOccurrence.id == occ_id,
            TodoOccurrence.todo_id == todo_id,
        )
    )
    occ = occ_result.first()
    if occ is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Occurrence not found",
        )

    if body.completed:
        occ.completed_at = datetime.now(timezone.utc)
    else:
        occ.completed_at = None

    if body.missed is not None:
        occ.missed = body.missed

    session.add(occ)
    await session.commit()
    await session.refresh(occ)

    return TodoOccurrenceRead(
        id=occ.id,
        todo_id=occ.todo_id,
        due_date=occ.due_date,
        completed_at=occ.completed_at,
        missed=occ.missed,
    )
