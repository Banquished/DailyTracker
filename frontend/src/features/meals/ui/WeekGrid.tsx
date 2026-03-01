import { MEAL_SLOTS, type MealPlanEntry, type MealSlot } from '../domain/types';
import { formatDate } from '../domain/meals';
import { DayMacroBar } from './DayMacroBar';
import { MealSlotCell } from './MealSlotCell';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

type WeekGridProps = {
  weekDates: Date[];
  entriesByDateSlot: Map<string, Map<MealSlot, MealPlanEntry[]>>;
  onAddEntry: (date: string, slot: MealSlot) => void;
  onRemoveEntry: (entryId: string) => void;
};

export function WeekGrid({
  weekDates,
  entriesByDateSlot,
  onAddEntry,
  onRemoveEntry,
}: WeekGridProps): React.ReactElement {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[700px] gap-px bg-border-subtle"
        style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}
      >
        {/* Header row: empty corner + 7 day columns */}
        <div className="bg-surface px-2 py-2 text-xs font-medium text-text-muted" />
        {weekDates.map((date, i) => {
          const dateStr = formatDate(date);
          const dayEntries = Array.from(
            entriesByDateSlot.get(dateStr)?.values() ?? [],
          ).flat();
          return (
            <div
              key={dateStr}
              className="bg-surface px-2 py-2 text-xs font-medium text-text-muted"
            >
              <div className="font-semibold text-text">{DAY_NAMES[i]}</div>
              <div className="text-text-muted">{dateStr.slice(5)}</div>
              <DayMacroBar entries={dayEntries} />
            </div>
          );
        })}

        {/* One row per meal slot */}
        {MEAL_SLOTS.map((slot) => (
          <>
            {/* Slot label */}
            <div
              key={`label-${slot}`}
              className="bg-surface px-2 py-2 text-xs font-medium text-text-muted"
            >
              {SLOT_LABELS[slot]}
            </div>

            {/* 7 cells */}
            {weekDates.map((date) => {
              const dateStr = formatDate(date);
              const slotEntries = entriesByDateSlot.get(dateStr)?.get(slot) ?? [];
              return (
                <div key={`${dateStr}-${slot}`} className="bg-surface p-1">
                  <MealSlotCell
                    date={dateStr}
                    slot={slot}
                    entries={slotEntries}
                    onAddEntry={onAddEntry}
                    onRemoveEntry={onRemoveEntry}
                  />
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
