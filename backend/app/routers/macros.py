import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query
from sqlmodel import select

from app.core.deps import CurrentUserIdDep, SessionDep
from app.models.macro import (
    DailyMacros,
    MacroProfile,
    MacroProfileCreate,
    MacroProfileRead,
)

router = APIRouter()


def _profile_read(profile: MacroProfile) -> MacroProfileRead:
    """Build the MacroProfileRead response schema from an ORM object."""
    return MacroProfileRead(
        id=profile.id,
        user_id=profile.user_id,
        calories=profile.calories,
        protein_g=profile.protein_g,
        carbs_g=profile.carbs_g,
        fat_g=profile.fat_g,
        updated_at=profile.updated_at,
    )


@router.get("/profile", response_model=MacroProfileRead)
async def get_macro_profile(
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> MacroProfileRead:
    """
    Get the current user's macro profile.
    A default profile is created automatically if none exists yet.
    """
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(MacroProfile).where(MacroProfile.user_id == user_uuid)
    )
    profile = result.first()

    if profile is None:
        profile = MacroProfile(user_id=user_uuid)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)

    return _profile_read(profile)


@router.put("/profile", response_model=MacroProfileRead)
async def upsert_macro_profile(
    body: MacroProfileCreate,
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
) -> MacroProfileRead:
    """
    Upsert the current user's macro profile.
    If no profile exists it is created; otherwise it is updated in place.
    """
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(MacroProfile).where(MacroProfile.user_id == user_uuid)
    )
    profile = result.first()

    if profile is None:
        profile = MacroProfile(
            user_id=user_uuid,
            calories=body.calories,
            protein_g=body.protein_g,
            carbs_g=body.carbs_g,
            fat_g=body.fat_g,
            updated_at=datetime.now(timezone.utc),
        )
    else:
        profile.calories = body.calories
        profile.protein_g = body.protein_g
        profile.carbs_g = body.carbs_g
        profile.fat_g = body.fat_g
        profile.updated_at = datetime.now(timezone.utc)

    session.add(profile)
    await session.commit()
    await session.refresh(profile)

    return _profile_read(profile)


@router.get("/daily", response_model=DailyMacros)
async def get_daily_macros(
    current_user_id: CurrentUserIdDep,
    session: SessionDep,
    date: Optional[str] = Query(default=None, description="YYYY-MM-DD"),
) -> DailyMacros:
    """
    Compute daily macros from meal plan entries for the given date.

    Phase 5 will add the meal_plan_entries and foods tables; until then
    this route returns zeros so callers already integrate against the
    correct contract.
    """
    from datetime import date as date_type

    date_str = date if date is not None else date_type.today().isoformat()

    # Phase 5 will replace this stub with the real join query:
    #   SELECT SUM(foods.calories_per_100g * meal_plan_entries.grams / 100), ...
    #   FROM meal_plan_entries
    #   JOIN foods ON meal_plan_entries.food_id = foods.id
    #   WHERE meal_plan_entries.user_id = :user_id AND meal_plan_entries.date = :date
    return DailyMacros(
        date=date_str,
        calories=0.0,
        protein_g=0.0,
        carbs_g=0.0,
        fat_g=0.0,
    )
