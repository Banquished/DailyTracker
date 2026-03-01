import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.deps import CurrentUserIdDep, SessionDep
from app.domain.macros import compute_macros_from_portion, sum_macros
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
    Compute daily macro totals from all meal plan entries for the given date.
    Defaults to today if no date is supplied.
    """
    from datetime import date as date_type

    from app.models.meal import MealPlanEntry

    date_str = date if date is not None else date_type.today().isoformat()
    target_date = date_type.fromisoformat(date_str)
    user_uuid = uuid.UUID(current_user_id)

    result = await session.exec(
        select(MealPlanEntry)
        .where(
            MealPlanEntry.user_id == user_uuid,
            MealPlanEntry.date == target_date,
        )
        .options(selectinload(MealPlanEntry.food))  # type: ignore[arg-type]
    )
    entries = result.all()

    macro_list = [
        compute_macros_from_portion(
            entry.food.calories_per_100g,
            entry.food.protein_g,
            entry.food.carbs_g,
            entry.food.fat_g,
            entry.grams,
        )
        for entry in entries
        if entry.food is not None
    ]

    totals: dict = (
        sum_macros(macro_list)
        if macro_list
        else {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
    )

    return DailyMacros(date=date_str, **totals)
