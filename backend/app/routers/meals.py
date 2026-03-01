import uuid
from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.deps import CurrentUserIdDep, SessionDep
from app.models.meal import (
    Food,
    FoodCreate,
    FoodRead,
    MealPlanEntry,
    MealPlanEntryCreate,
    MealPlanEntryRead,
    MealSlot,
)

foods_router = APIRouter()
meals_router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _food_read(food: Food) -> FoodRead:
    return FoodRead(
        id=food.id,
        user_id=food.user_id,
        name=food.name,
        calories_per_100g=food.calories_per_100g,
        protein_g=food.protein_g,
        carbs_g=food.carbs_g,
        fat_g=food.fat_g,
    )


def _entry_read(entry: MealPlanEntry) -> MealPlanEntryRead:
    food_read = _food_read(entry.food) if entry.food is not None else None
    return MealPlanEntryRead(
        id=entry.id,
        user_id=entry.user_id,
        date=entry.date,
        meal_slot=entry.meal_slot,
        food_id=entry.food_id,
        grams=entry.grams,
        notes=entry.notes,
        food=food_read,
    )


def _week_monday(ref: date) -> date:
    """Return the Monday of the week containing ref."""
    return ref - timedelta(days=ref.weekday())


# ---------------------------------------------------------------------------
# Foods routes
# ---------------------------------------------------------------------------


@foods_router.get("", response_model=list[FoodRead])
async def list_foods(
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
    search: str | None = Query(default=None, description="Filter by name (case-insensitive)"),
) -> list[FoodRead]:
    """Return all foods belonging to the current user, optionally filtered by name."""
    user_uuid = uuid.UUID(current_user_id)

    stmt = select(Food).where(Food.user_id == user_uuid)
    if search:
        stmt = stmt.where(Food.name.ilike(f"%{search}%"))

    result = await session.exec(stmt)
    foods = result.all()
    return [_food_read(f) for f in foods]


@foods_router.post("", response_model=FoodRead, status_code=status.HTTP_201_CREATED)
async def create_food(
    body: FoodCreate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> FoodRead:
    """Create a new food entry for the current user."""
    user_uuid = uuid.UUID(current_user_id)

    food = Food(
        user_id=user_uuid,
        name=body.name,
        calories_per_100g=body.calories_per_100g,
        protein_g=body.protein_g,
        carbs_g=body.carbs_g,
        fat_g=body.fat_g,
    )
    session.add(food)
    await session.commit()
    await session.refresh(food)

    return _food_read(food)


@foods_router.delete("/{food_id}", response_model=dict)
async def delete_food(
    food_id: uuid.UUID,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> dict[str, bool]:
    """Hard-delete a food and all meal plan entries that reference it. Ownership is verified."""
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(Food).where(Food.id == food_id, Food.user_id == user_uuid)
    )
    food = result.first()
    if food is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found",
        )

    # Delete all meal plan entries referencing this food before deleting the food itself
    entries_result = await session.exec(
        select(MealPlanEntry).where(MealPlanEntry.food_id == food_id)
    )
    for entry in entries_result.all():
        await session.delete(entry)

    await session.delete(food)
    await session.commit()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Meal plan routes
# ---------------------------------------------------------------------------


@meals_router.get("", response_model=list[MealPlanEntryRead])
async def list_meals_for_week(
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
    week: str = Query(..., description="Any date in the target week (YYYY-MM-DD); the Monday is derived automatically"),
) -> list[MealPlanEntryRead]:
    """
    Return all meal plan entries for the 7-day window (Mon–Sun) that contains `week`.
    Food details are eagerly loaded.
    """
    user_uuid = uuid.UUID(current_user_id)

    ref_date = date.fromisoformat(week)
    monday = _week_monday(ref_date)
    sunday = monday + timedelta(days=6)

    result = await session.exec(
        select(MealPlanEntry)
        .where(
            MealPlanEntry.user_id == user_uuid,
            MealPlanEntry.date >= monday,
            MealPlanEntry.date <= sunday,
        )
        .options(selectinload(MealPlanEntry.food))  # type: ignore[arg-type]
    )
    entries = result.all()
    return [_entry_read(e) for e in entries]


@meals_router.post(
    "/{entry_date}/{slot}",
    response_model=MealPlanEntryRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_meal_entry(
    entry_date: date,
    slot: MealSlot,
    body: MealPlanEntryCreate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> MealPlanEntryRead:
    """
    Add a food to a specific date and meal slot.
    The referenced food must belong to the current user.
    """
    user_uuid = uuid.UUID(current_user_id)

    # Verify the food exists and belongs to the current user
    food_result = await session.exec(
        select(Food).where(Food.id == body.food_id, Food.user_id == user_uuid)
    )
    food = food_result.first()
    if food is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found",
        )

    entry = MealPlanEntry(
        user_id=user_uuid,
        date=entry_date,
        meal_slot=slot,
        food_id=body.food_id,
        grams=body.grams,
        notes=body.notes,
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    # Reload with food eagerly to populate the response
    loaded_result = await session.exec(
        select(MealPlanEntry)
        .where(MealPlanEntry.id == entry.id)
        .options(selectinload(MealPlanEntry.food))  # type: ignore[arg-type]
    )
    loaded_entry = loaded_result.first()
    if loaded_entry is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reload created entry",
        )
    return _entry_read(loaded_entry)


@meals_router.delete("/{entry_id}", response_model=dict)
async def delete_meal_entry(
    entry_id: uuid.UUID,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> dict[str, bool]:
    """Hard-delete a meal plan entry. Ownership is verified."""
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(MealPlanEntry).where(
            MealPlanEntry.id == entry_id,
            MealPlanEntry.user_id == user_uuid,
        )
    )
    entry = result.first()
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan entry not found",
        )

    await session.delete(entry)
    await session.commit()
    return {"ok": True}
