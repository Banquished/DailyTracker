import { useState } from 'react';
import { useHabits } from '../api/hooks';
import { HabitRow } from './HabitRow';
import { HabitForm } from './HabitForm';

export function HabitsPageView(): React.ReactElement {
  const [formOpen, setFormOpen] = useState(false);
  const { data: habits, isLoading, isError } = useHabits();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Habits</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setFormOpen(true)}
        >
          + Add Habit
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <p className="text-sm text-text-muted">Loading habits...</p>
      )}

      {/* Error state */}
      {isError && (
        <div className="card card-padding">
          <p className="text-sm text-danger">Failed to load habits. Please refresh.</p>
        </div>
      )}

      {/* Habit list */}
      {habits !== undefined && habits.length > 0 && (
        <div className="space-y-4">
          {habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {habits !== undefined && habits.length === 0 && (
        <div className="card card-padding text-center">
          <p className="text-sm text-text-muted">
            No habits yet. Create one to get started.
          </p>
        </div>
      )}

      {/* Create form modal */}
      <HabitForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
