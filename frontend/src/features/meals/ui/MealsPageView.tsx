import { useState } from 'react';
import { useMealStore } from '../stores/mealStore';
import { useMealPlan, useAddMealEntry, useRemoveMealEntry } from '../api/hooks';
import { groupByDateAndSlot, formatDate, getWeekDates } from '../domain/meals';
import type { MealSlot } from '../domain/types';
import { WeekGrid } from './WeekGrid';
import { FoodSearchModal } from './FoodSearchModal';

export function MealsPageView(): React.ReactElement {
  const [addTarget, setAddTarget] = useState<{ date: string; slot: MealSlot } | null>(null);

  const weekMonday = useMealStore((s) => s.weekMonday);
  const prevWeek = useMealStore((s) => s.prevWeek);
  const nextWeek = useMealStore((s) => s.nextWeek);

  const weekMondayStr = formatDate(weekMonday);
  const weekDates = getWeekDates(weekMonday);

  const { data: entries = [], isLoading } = useMealPlan(weekMondayStr);
  const addEntry = useAddMealEntry();
  const removeEntry = useRemoveMealEntry();

  const entriesByDateSlot = groupByDateAndSlot(entries);

  function handleAddEntry(date: string, slot: MealSlot): void {
    setAddTarget({ date, slot });
  }

  function handleFoodSelected(foodId: string, grams: number): void {
    if (!addTarget) return;
    addEntry.mutate({ date: addTarget.date, slot: addTarget.slot, foodId, grams });
    setAddTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Meal Planner</h1>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost" onClick={prevWeek}>
            &larr; Prev
          </button>
          <span className="text-sm text-text-muted">Week of {weekMondayStr}</span>
          <button type="button" className="btn btn-ghost" onClick={nextWeek}>
            Next &rarr;
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : (
        <WeekGrid
          weekDates={weekDates}
          entriesByDateSlot={entriesByDateSlot}
          onAddEntry={handleAddEntry}
          onRemoveEntry={(id) => removeEntry.mutate(id)}
        />
      )}

      <FoodSearchModal
        open={addTarget !== null}
        onClose={() => setAddTarget(null)}
        onSelect={handleFoodSelected}
      />
    </div>
  );
}
