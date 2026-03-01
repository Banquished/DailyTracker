import { useState } from 'react';
import { useWeightEntries, useDeleteWeightEntry } from '../api/hooks';
import { LogWeightForm } from './LogWeightForm';
import { WeightChart } from './WeightChart';

type DateRange = 30 | 90 | 180;

const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 180, label: 'Last 180 days' },
];

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WeightPageView(): React.ReactElement {
  const [selectedRange, setSelectedRange] = useState<DateRange>(30);

  const endDate = todayISO();
  const startDate = offsetDate(selectedRange);

  const { data: entries = [], isLoading, isError } = useWeightEntries(startDate, endDate);
  const { mutate: deleteEntry } = useDeleteWeightEntry();

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Weight</h1>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`btn ${selectedRange === value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedRange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Log form */}
      <LogWeightForm />

      {/* Chart */}
      {isLoading ? (
        <div className="card card-padding">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Loading…
          </p>
        </div>
      ) : isError ? (
        <div className="card card-padding">
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            Failed to load weight entries.
          </p>
        </div>
      ) : (
        <WeightChart entries={entries} />
      )}

      {/* Recent entries table */}
      {!isLoading && !isError && sortedEntries.length > 0 && (
        <div className="card card-padding">
          <h3 className="mb-4 text-base font-semibold">Recent Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Weight (kg)</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b last:border-0"
                    style={{ borderColor: 'var(--color-border-subtle)' }}
                  >
                    <td className="py-2">{entry.date}</td>
                    <td className="py-2 font-medium">{entry.weight_kg} kg</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        className="btn btn-ghost text-xs"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => deleteEntry(entry.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
