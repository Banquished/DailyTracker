import uuid
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.deps import CurrentUserIdDep, SessionDep
from app.domain.habits import calculate_streak
from app.domain.macros import compute_macros_from_portion, sum_macros
from app.models.habit import Habit, HabitLog
from app.models.macro import MacroProfile
from app.models.meal import MealPlanEntry
from app.models.todo import Todo, TodoOccurrence
from app.models.weight import WeightEntry

router = APIRouter()


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class DashboardTodoOccurrence(BaseModel):
    id: str
    todo_id: str
    title: str
    completed: bool
    missed: bool


class DashboardHabit(BaseModel):
    id: str
    name: str
    color: str
    logged_today: bool
    streak: int


class DashboardWeight(BaseModel):
    latest_kg: Optional[float]
    previous_kg: Optional[float]  # second most recent entry
    delta_kg: Optional[float]  # latest - previous (None if < 2 entries)


class DashboardMacros(BaseModel):
    goal_calories: int
    goal_protein_g: int
    goal_carbs_g: int
    goal_fat_g: int
    actual_calories: float
    actual_protein_g: float
    actual_carbs_g: float
    actual_fat_g: float


class DashboardResponse(BaseModel):
    date: str  # today YYYY-MM-DD
    todos: list[DashboardTodoOccurrence]
    habits: list[DashboardHabit]
    weight: DashboardWeight
    macros: DashboardMacros
    todo_count: int
    todo_completed_count: int
    habit_count: int
    habit_logged_count: int


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


@router.get("/today", response_model=DashboardResponse)
async def get_dashboard_today(
    session: SessionDep,
    current_user_id: CurrentUserIdDep,
) -> DashboardResponse:
    """
    Aggregate all user data for today in a single request.

    Returns todos with today's occurrences, active habits with streak data,
    the two most recent weight entries, and macro totals vs. goals.
    """
    today = date.today()
    today_str = today.isoformat()
    user_uuid = uuid.UUID(current_user_id)

    # ------------------------------------------------------------------
    # 1. Todos: active todos + today's occurrences
    # ------------------------------------------------------------------
    todos_result = await session.exec(
        select(Todo).where(
            Todo.user_id == user_uuid,
            Todo.active == True,  # noqa: E712
        )
    )
    todos = todos_result.all()

    today_occurrences: list[DashboardTodoOccurrence] = []
    for todo in todos:
        occ_result = await session.exec(
            select(TodoOccurrence).where(
                TodoOccurrence.todo_id == todo.id,
                TodoOccurrence.due_date == today,
            )
        )
        for occ in occ_result.all():
            today_occurrences.append(
                DashboardTodoOccurrence(
                    id=str(occ.id),
                    todo_id=str(todo.id),
                    title=todo.title,
                    completed=occ.completed_at is not None,
                    missed=occ.missed,
                )
            )

    # ------------------------------------------------------------------
    # 2. Habits: active habits with streak and today's log status
    #    Load logs from the past 365 days (same window as GET /habits)
    # ------------------------------------------------------------------
    habits_result = await session.exec(
        select(Habit).where(
            Habit.user_id == user_uuid,
            Habit.active == True,  # noqa: E712
        )
    )
    habits = habits_result.all()

    cutoff = today - timedelta(days=365)
    dashboard_habits: list[DashboardHabit] = []
    for habit in habits:
        logs_result = await session.exec(
            select(HabitLog).where(
                HabitLog.habit_id == habit.id,
                HabitLog.date >= cutoff,
            )
        )
        logs = list(logs_result.all())
        logged_today = any(log.date == today and log.completed for log in logs)
        streak = calculate_streak(logs, today)
        dashboard_habits.append(
            DashboardHabit(
                id=str(habit.id),
                name=habit.name,
                color=habit.color,
                logged_today=logged_today,
                streak=streak,
            )
        )

    # ------------------------------------------------------------------
    # 3. Weight: two most recent entries
    # ------------------------------------------------------------------
    weight_result = await session.exec(
        select(WeightEntry)
        .where(WeightEntry.user_id == user_uuid)
        .order_by(WeightEntry.date.desc())  # type: ignore[union-attr]
        .limit(2)
    )
    weight_entries = weight_result.all()

    latest_kg: Optional[float] = float(weight_entries[0].weight_kg) if weight_entries else None
    previous_kg: Optional[float] = float(weight_entries[1].weight_kg) if len(weight_entries) > 1 else None
    delta_kg: Optional[float] = (
        round(latest_kg - previous_kg, 2)
        if (latest_kg is not None and previous_kg is not None)
        else None
    )

    # ------------------------------------------------------------------
    # 4. Macros: profile goals + today's actual totals from meal plan
    # ------------------------------------------------------------------
    profile_result = await session.exec(
        select(MacroProfile).where(MacroProfile.user_id == user_uuid)
    )
    profile = profile_result.first()

    meal_entries_result = await session.exec(
        select(MealPlanEntry)
        .where(
            MealPlanEntry.user_id == user_uuid,
            MealPlanEntry.date == today,
        )
        .options(selectinload(MealPlanEntry.food))  # type: ignore[arg-type]
    )
    meal_entries = meal_entries_result.all()

    macro_list = [
        compute_macros_from_portion(
            entry.food.calories_per_100g,
            entry.food.protein_g,
            entry.food.carbs_g,
            entry.food.fat_g,
            entry.grams,
        )
        for entry in meal_entries
        if entry.food is not None
    ]
    totals: dict = (
        sum_macros(macro_list)
        if macro_list
        else {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
    )

    return DashboardResponse(
        date=today_str,
        todos=today_occurrences,
        habits=dashboard_habits,
        weight=DashboardWeight(
            latest_kg=latest_kg,
            previous_kg=previous_kg,
            delta_kg=delta_kg,
        ),
        macros=DashboardMacros(
            goal_calories=profile.calories if profile else 2000,
            goal_protein_g=profile.protein_g if profile else 150,
            goal_carbs_g=profile.carbs_g if profile else 200,
            goal_fat_g=profile.fat_g if profile else 65,
            actual_calories=totals["calories"],
            actual_protein_g=totals["protein_g"],
            actual_carbs_g=totals["carbs_g"],
            actual_fat_g=totals["fat_g"],
        ),
        todo_count=len(today_occurrences),
        todo_completed_count=sum(1 for t in today_occurrences if t.completed),
        habit_count=len(dashboard_habits),
        habit_logged_count=sum(1 for h in dashboard_habits if h.logged_today),
    )
