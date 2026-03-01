import React from 'react';
import { useDashboard } from '../api/hooks';
import { TodayTodoList } from './TodayTodoList';
import { HabitStreakBar } from './HabitStreakBar';
import { WeightDeltaBadge } from './WeightDeltaBadge';
import { MacroRingMini } from './MacroRingMini';
import { QuickActions } from './QuickActions';

function StatCard({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="card card-padding text-center">
      <p className="text-xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

export function DashboardPageView(): React.ReactElement {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) return <p className="text-sm text-text-muted">Loading dashboard...</p>;
  if (isError || !data) return <p className="text-sm text-danger">Failed to load dashboard.</p>;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h4 font-semibold">Dashboard</h1>
        <p className="text-sm text-text-muted">{today}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Todos done" value={`${data.todo_completed_count}/${data.todo_count}`} />
        <StatCard label="Habits logged" value={`${data.habit_logged_count}/${data.habit_count}`} />
        <StatCard
          label="Weight"
          value={data.weight.latest_kg !== null ? `${data.weight.latest_kg} kg` : '—'}
        />
        <StatCard label="Calories" value={`${Math.round(data.macros.actual_calories)} kcal`} />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Todos */}
        <div className="card card-padding space-y-3">
          <h2 className="text-sm font-semibold text-text">Today's Todos</h2>
          <TodayTodoList todos={data.todos} />
        </div>

        {/* Habits */}
        <div className="card card-padding space-y-3">
          <h2 className="text-sm font-semibold text-text">Habits</h2>
          <HabitStreakBar habits={data.habits} />
        </div>

        {/* Weight */}
        <div className="card card-padding space-y-3">
          <h2 className="text-sm font-semibold text-text">Weight</h2>
          <WeightDeltaBadge weight={data.weight} />
        </div>

        {/* Macros */}
        <div className="card card-padding space-y-3">
          <h2 className="text-sm font-semibold text-text">Macros Today</h2>
          <MacroRingMini macros={data.macros} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="card card-padding space-y-3">
        <h2 className="text-sm font-semibold text-text">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
}
