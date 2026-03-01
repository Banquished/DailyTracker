import { useState } from 'react';
import type { FormEvent } from 'react';
import type { HabitCreate, HabitRecurrence, HabitType } from '../domain/types';
import { useCreateHabit } from '../api/hooks';

type HabitFormProps = {
  open: boolean;
  onClose: () => void;
};

const PRESET_COLORS: Array<{ label: string; value: string }> = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Pink', value: '#ec4899' },
];

export function HabitForm({ open, onClose }: HabitFormProps): React.ReactElement | null {
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('binary');
  const [targetCount, setTargetCount] = useState<string>('');
  const [recurrence, setRecurrence] = useState<HabitRecurrence>('daily');
  const [color, setColor] = useState(PRESET_COLORS[0]?.value ?? '#2563eb');

  const createHabit = useCreateHabit();

  function resetForm(): void {
    setName('');
    setType('binary');
    setTargetCount('');
    setRecurrence('daily');
    setColor(PRESET_COLORS[0]?.value ?? '#2563eb');
  }

  function handleClose(): void {
    resetForm();
    onClose();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const data: HabitCreate = {
      name: name.trim(),
      type,
      recurrence,
      color,
    };

    if (type === 'count' && targetCount !== '') {
      const parsed = parseInt(targetCount, 10);
      if (!isNaN(parsed) && parsed > 0) {
        data.target_count = parsed;
      }
    }

    createHabit.mutate(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  }

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={handleClose}
    >
      {/* Modal panel */}
      <div
        className="card card-padding w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-form-title"
      >
        <h2 id="habit-form-title" className="mb-4 text-lg font-semibold text-text">
          New Habit
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="input-root">
            <label className="input-label" htmlFor="habit-name">
              Name
            </label>
            <input
              id="habit-name"
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning run"
              required
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="input-root">
            <label className="input-label" htmlFor="habit-type">
              Type
            </label>
            <select
              id="habit-type"
              className="input-field"
              value={type}
              onChange={(e) => setType(e.target.value as HabitType)}
            >
              <option value="binary">Binary (done / not done)</option>
              <option value="count">Count (numeric target)</option>
            </select>
          </div>

          {/* Target count — only when type=count */}
          {type === 'count' && (
            <div className="input-root">
              <label className="input-label" htmlFor="habit-target">
                Target count
              </label>
              <input
                id="habit-target"
                type="number"
                className="input-field"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                placeholder="e.g. 8 glasses of water"
                min={1}
              />
            </div>
          )}

          {/* Recurrence */}
          <div className="input-root">
            <label className="input-label" htmlFor="habit-recurrence">
              Recurrence
            </label>
            <select
              id="habit-recurrence"
              className="input-field"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as HabitRecurrence)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Color swatches */}
          <div className="input-root">
            <span className="input-label">Color</span>
            <div className="flex gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  aria-label={preset.label}
                  title={preset.label}
                  onClick={() => setColor(preset.value)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: preset.value,
                    border:
                      color === preset.value
                        ? '3px solid var(--color-text)'
                        : '3px solid transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createHabit.isPending || name.trim() === ''}
            >
              {createHabit.isPending ? 'Saving...' : 'Create Habit'}
            </button>
          </div>

          {createHabit.isError && (
            <p className="text-sm text-danger">
              Failed to create habit. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
