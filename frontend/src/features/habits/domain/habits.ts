import type { Habit, HabitLog } from './types';

export type GridCell = { date: string; log: HabitLog | null };

/**
 * Format a Date as YYYY-MM-DD (local time).
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Build a 52-week grid (364 days) ending on endDate.
 * Returns a 2D array: weeks[weekIndex][dayIndex] where dayIndex 0=Sunday.
 * The grid always starts on a Sunday. We find the most recent Sunday on or
 * before (endDate - 363 days), giving us exactly 52 full weeks.
 */
export function buildCommitGrid(habit: Habit, endDate: Date): GridCell[][] {
  // Build a lookup map from date string → log
  const logMap = new Map<string, HabitLog>();
  for (const log of habit.logs) {
    logMap.set(log.date, log);
  }

  // Find the start: go back 363 days from endDate, then rewind to Sunday
  const start = new Date(endDate);
  start.setDate(start.getDate() - 363);
  // Rewind to previous (or same) Sunday
  const dayOfWeek = start.getDay(); // 0=Sun
  start.setDate(start.getDate() - dayOfWeek);

  const weeks: GridCell[][] = [];

  // 52 weeks × 7 days
  const cursor = new Date(start);
  for (let w = 0; w < 52; w++) {
    const week: GridCell[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = formatDate(cursor);
      week.push({
        date: dateStr,
        log: logMap.get(dateStr) ?? null,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

/**
 * Calculate current streak: consecutive days going back from today with
 * completed=true logs.
 */
export function calculateStreak(habit: Habit, today: Date): number {
  const logMap = new Map<string, HabitLog>();
  for (const log of habit.logs) {
    logMap.set(log.date, log);
  }

  let streak = 0;
  const cursor = new Date(today);

  while (true) {
    const dateStr = formatDate(cursor);
    const log = logMap.get(dateStr);
    if (log?.completed === true) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get completion intensity 0–4 for a cell (for color opacity levels like GitHub).
 * For binary: 0 (no log or not completed) or 4 (completed)
 * For count:  0 (no log), 1 (< 25% target), 2 (25–50%), 3 (50–75%), 4 (≥ 75%)
 */
export function getCellIntensity(habit: Habit, log: HabitLog | null): 0 | 1 | 2 | 3 | 4 {
  if (log === null) return 0;

  if (habit.type === 'binary') {
    return log.completed ? 4 : 0;
  }

  // count type
  const target = habit.target_count;
  if (target === null || target <= 0) {
    return log.completed ? 4 : 0;
  }

  const count = log.count ?? 0;
  const ratio = count / target;

  if (ratio <= 0) return 0;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

/**
 * Calculate completion percentage for the last N days.
 */
export function calcLast30DaysPct(habit: Habit, today: Date, days = 30): number {
  const logMap = new Map<string, HabitLog>();
  for (const log of habit.logs) {
    logMap.set(log.date, log);
  }

  let completed = 0;
  const cursor = new Date(today);

  for (let i = 0; i < days; i++) {
    const dateStr = formatDate(cursor);
    const log = logMap.get(dateStr);
    if (log?.completed === true) {
      completed++;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return Math.round((completed / days) * 100);
}
