import { useState } from 'react';
import { useLogWeight } from '../api/hooks';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LogWeightForm(): React.ReactElement {
  const [date, setDate] = useState<string>(todayISO());
  const [weightInput, setWeightInput] = useState<string>('');

  const { mutate, isPending, isError } = useLogWeight();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const weight_kg = parseFloat(weightInput);
    if (!date || isNaN(weight_kg) || weight_kg <= 0) return;
    mutate(
      { date, weight_kg },
      {
        onSuccess: () => {
          setWeightInput('');
          setDate(todayISO());
        },
      },
    );
  }

  return (
    <div className="card card-padding">
      <h3 className="mb-4 text-base font-semibold">Log Weight</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="input-root flex-1 min-w-[130px]">
          <label htmlFor="weight-date" className="input-label">
            Date
          </label>
          <input
            id="weight-date"
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="input-root flex-1 min-w-[130px]">
          <label htmlFor="weight-kg" className="input-label">
            Weight (kg)
          </label>
          <input
            id="weight-kg"
            type="number"
            step="0.1"
            min="0"
            className="input-field"
            placeholder="70.5"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? 'Saving…' : 'Log Weight'}
        </button>
      </form>
      {isError && (
        <p className="mt-2 text-sm" style={{ color: 'var(--color-danger)' }}>
          Failed to log weight. Please try again.
        </p>
      )}
    </div>
  );
}
