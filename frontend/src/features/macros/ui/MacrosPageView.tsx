import { useState } from 'react';
import { useMacroProfile, useDailyMacros } from '../api/hooks';
import { MacroRingChart } from './MacroRingChart';
import { MacroGoalForm } from './MacroGoalForm';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MacrosPageView(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [goalsExpanded, setGoalsExpanded] = useState<boolean>(false);

  const { data: profile, isLoading: profileLoading, isError: profileError } = useMacroProfile();
  const { data: daily, isLoading: dailyLoading, isError: dailyError } = useDailyMacros(selectedDate);

  const isLoading = profileLoading || dailyLoading;
  const isError = profileError || dailyError;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Macros</h1>
        <div className="input-root">
          <label htmlFor="macro-date" className="input-label sr-only">
            Date
          </label>
          <input
            id="macro-date"
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="card card-padding">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Loading…
          </p>
        </div>
      ) : isError ? (
        <div className="card card-padding">
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            Failed to load macro data.
          </p>
        </div>
      ) : daily && profile ? (
        <MacroRingChart daily={daily} profile={profile} />
      ) : (
        <div className="card card-padding">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No macro data for this date. Set your goals below and add meals to see data.
          </p>
        </div>
      )}

      {/* Info note */}
      <div
        className="rounded-md px-4 py-3 text-sm"
        style={{
          background: 'var(--color-info-soft)',
          color: 'var(--color-info)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        Macros are calculated from your meal plan. Add meals to see data.
      </div>

      {/* Collapsible goals section */}
      <div className="card card-padding">
        <button
          type="button"
          className="flex w-full items-center justify-between text-base font-semibold"
          onClick={() => setGoalsExpanded((prev) => !prev)}
          aria-expanded={goalsExpanded}
        >
          <span>Edit Goals</span>
          <span
            className="text-lg leading-none transition-transform"
            style={{
              color: 'var(--color-text-muted)',
              transform: goalsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            &#8964;
          </span>
        </button>
        {goalsExpanded && (
          <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <MacroGoalForm profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
}
