import type { MealPlanEntry, MealSlot } from '../domain/types';

type MealSlotCellProps = {
  date: string;
  slot: MealSlot;
  entries: MealPlanEntry[];
  onAddEntry: (date: string, slot: MealSlot) => void;
  onRemoveEntry: (entryId: string) => void;
};

export function MealSlotCell({
  date,
  slot,
  entries,
  onAddEntry,
  onRemoveEntry,
}: MealSlotCellProps): React.ReactElement {
  return (
    <div className="min-h-[3rem] rounded border border-border-subtle p-1">
      {entries.length > 0 && (
        <ul className="mb-1 flex flex-col gap-0.5">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-1 text-xs text-text"
            >
              <span className="truncate">
                {entry.food.name} {entry.grams}g
              </span>
              <button
                type="button"
                aria-label={`Remove ${entry.food.name}`}
                className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-danger"
                onClick={() => onRemoveEntry(entry.id)}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        aria-label={`Add food to ${slot} on ${date}`}
        className="w-full rounded p-0.5 text-center text-xs text-text-muted transition-colors hover:text-accent"
        onClick={() => onAddEntry(date, slot)}
      >
        +
      </button>
    </div>
  );
}
