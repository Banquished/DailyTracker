import React from 'react';
import type { DashboardHabit } from '../domain/types';

export function HabitStreakBar({ habits }: { habits: DashboardHabit[] }): React.ReactElement {
  if (habits.length === 0) {
    return <p className="text-sm text-text-muted">No habits tracked.</p>;
  }
  return (
    <ul className="space-y-2">
      {habits.map((habit) => (
        <li key={habit.id} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <span className="flex-1 text-text">{habit.name}</span>
          {habit.streak > 0 && (
            <span className="text-xs text-warning">{habit.streak}d streak</span>
          )}
          <span className={`badge ${habit.logged_today ? 'badge-success' : 'badge-info'}`}>
            {habit.logged_today ? '✓ today' : '○ pending'}
          </span>
        </li>
      ))}
    </ul>
  );
}
