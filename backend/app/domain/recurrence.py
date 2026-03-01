"""
Pure recurrence logic — no DB, no HTTP, no framework imports.
All functions are deterministic given their inputs.
"""
from datetime import date, timedelta

from app.models.todo import RecurrenceType, TodoOccurrence


def generate_dates_in_range(
    recurrence: RecurrenceType,
    start_date: date,
    end_date: date,
) -> list[date]:
    """
    Return all dates in [start_date, end_date] inclusive on which a new
    occurrence should be generated for a todo, given its recurrence type.

    RecurrenceType.none:    [] — non-recurring todos are managed manually.
    RecurrenceType.daily:   every calendar day in the range.
    RecurrenceType.weekly:  the same weekday as start_date, once per week.
    RecurrenceType.monthly: the same day-of-month as start_date, once per
                            month (months where that day doesn't exist are
                            skipped rather than clamped to avoid duplicates).
    """
    if recurrence is RecurrenceType.none:
        return []

    if start_date > end_date:
        return []

    dates: list[date] = []

    if recurrence is RecurrenceType.daily:
        current = start_date
        while current <= end_date:
            dates.append(current)
            current += timedelta(days=1)

    elif recurrence is RecurrenceType.weekly:
        target_weekday = start_date.weekday()  # 0=Monday … 6=Sunday
        # Fast-forward to the first occurrence of that weekday >= start_date
        days_ahead = (target_weekday - start_date.weekday()) % 7
        current = start_date + timedelta(days=days_ahead)
        while current <= end_date:
            dates.append(current)
            current += timedelta(weeks=1)

    elif recurrence is RecurrenceType.monthly:
        target_day = start_date.day
        # Walk month by month starting from start_date's month
        year = start_date.year
        month = start_date.month
        while True:
            # Determine how many days this month has
            if month == 12:
                days_in_month = (date(year + 1, 1, 1) - date(year, month, 1)).days
            else:
                days_in_month = (date(year, month + 1, 1) - date(year, month, 1)).days

            if target_day <= days_in_month:
                candidate = date(year, month, target_day)
                if candidate > end_date:
                    break
                if candidate >= start_date:
                    dates.append(candidate)

            # Advance to the next month
            if month == 12:
                year += 1
                month = 1
            else:
                month += 1

            # Stop if we've gone past end_date entirely
            if date(year, month, 1) > end_date:
                break

    return dates


def get_or_create_occurrences(
    recurrence: RecurrenceType,
    todo_created_at_date: date,
    existing_occurrences: list[TodoOccurrence],
    start_date: date,
    end_date: date,
) -> list[date]:
    """
    Return the subset of dates (within [start_date, end_date]) that need a
    *new* occurrence created — i.e. dates produced by the recurrence rule
    that do not already have an existing occurrence.

    Parameters
    ----------
    recurrence:
        The todo's recurrence setting.
    todo_created_at_date:
        The date the todo was created; used as the anchor for weekly/monthly
        calculations so the day-of-week / day-of-month stays consistent.
    existing_occurrences:
        All TodoOccurrence rows already persisted for this todo.
    start_date / end_date:
        The requested date window.
    """
    existing_due_dates: set[date] = {occ.due_date for occ in existing_occurrences}

    all_dates = generate_dates_in_range(recurrence, todo_created_at_date, end_date)

    missing: list[date] = [
        d for d in all_dates if d >= start_date and d not in existing_due_dates
    ]
    return missing
