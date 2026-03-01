import type { Habit } from '../domain/types';
import { calculateStreak, calcLast30DaysPct, formatDate } from '../domain/habits';
import { useLogHabit, useDeleteHabitLog } from '../api/hooks';
import { CommitGrid } from './CommitGrid';

type HabitRowProps = {
  habit: Habit;
};

export function HabitRow({ habit }: HabitRowProps): React.ReactElement {
  const today = new Date();
  const todayStr = formatDate(today);

  const streak = calculateStreak(habit, today);
  const pct = calcLast30DaysPct(habit, today);

  const todayLog = habit.logs.find((l) => l.date === todayStr) ?? null;
  const isLoggedToday = todayLog !== null && todayLog.completed;

  const logHabit = useLogHabit();
  const deleteLog = useDeleteHabitLog();

  function handleLogToday(): void {
    logHabit.mutate({ habitId: habit.id, data: { date: todayStr, completed: true } });
  }

  function handleDeleteLog(): void {
    if (todayLog === null) return;
    deleteLog.mutate({ habitId: habit.id, logId: todayLog.id });
  }

  return (
    <div className="card card-padding space-y-3">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Color dot */}
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: habit.color,
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold text-text truncate">{habit.name}</h3>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-text-muted shrink-0">
          <span>
            <span className="font-medium text-text">{streak}</span>
            {' '}day streak
          </span>
          <span>
            <span className="font-medium text-text">{pct}%</span>
            {' '}last 30d
          </span>
          <span className="badge badge-info text-xs capitalize">{habit.recurrence}</span>
        </div>
      </div>

      {/* Commit grid */}
      <CommitGrid habit={habit} />

      {/* Log today button */}
      <div className="flex items-center gap-2 pt-1">
        {isLoggedToday ? (
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={handleDeleteLog}
            disabled={deleteLog.isPending}
            aria-label={`Undo today's log for ${habit.name}`}
          >
            Logged today ✓ (undo)
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary text-sm"
            onClick={handleLogToday}
            disabled={logHabit.isPending}
            aria-label={`Log today for ${habit.name}`}
          >
            {logHabit.isPending ? 'Logging...' : 'Log today'}
          </button>
        )}

        {(logHabit.isError || deleteLog.isError) && (
          <span className="text-xs text-danger">Action failed. Try again.</span>
        )}
      </div>
    </div>
  );
}
