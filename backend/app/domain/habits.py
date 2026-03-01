from datetime import date, timedelta

from app.models.habit import HabitLog


def calculate_streak(logs: list[HabitLog], today: date) -> int:
    """
    Calculate current streak: number of consecutive days (going back from today)
    where completed=True.

    Builds a set of completed dates, then counts backwards from today until a
    gap is found.  A missing day (no log or completed=False) breaks the streak.
    """
    completed_dates: set[date] = {log.date for log in logs if log.completed}

    streak = 0
    current = today
    while current in completed_dates:
        streak += 1
        current = current - timedelta(days=1)

    return streak


def calculate_completion_rate(logs: list[HabitLog], days: int = 30) -> float:
    """
    Percentage of days in the last N days that have a completed log.
    The window is [today - days + 1, today] inclusive.
    Returns a float in the range 0.0–1.0.
    """
    if days <= 0:
        return 0.0

    today = date.today()
    window_start = today - timedelta(days=days - 1)

    completed_in_window = sum(
        1
        for log in logs
        if log.completed and window_start <= log.date <= today
    )

    return completed_in_window / days
