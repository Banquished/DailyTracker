import type { MealPlanEntry, MealSlot, EntryMacros } from './types';

/** Compute macros for a single entry based on grams and food's per-100g values */
export function computeEntryMacros(entry: MealPlanEntry): EntryMacros {
  const factor = entry.grams / 100;
  return {
    calories: entry.food.calories_per_100g * factor,
    protein_g: entry.food.protein_g * factor,
    carbs_g: entry.food.carbs_g * factor,
    fat_g: entry.food.fat_g * factor,
  };
}

/** Sum macros across multiple entries */
export function sumMacros(entries: MealPlanEntry[]): EntryMacros {
  return entries.reduce(
    (acc, entry) => {
      const m = computeEntryMacros(entry);
      return {
        calories: acc.calories + m.calories,
        protein_g: acc.protein_g + m.protein_g,
        carbs_g: acc.carbs_g + m.carbs_g,
        fat_g: acc.fat_g + m.fat_g,
      };
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

/** Group entries by date, then by meal slot */
export function groupByDateAndSlot(
  entries: MealPlanEntry[],
): Map<string, Map<MealSlot, MealPlanEntry[]>> {
  const result = new Map<string, Map<MealSlot, MealPlanEntry[]>>();
  for (const entry of entries) {
    let bySlot = result.get(entry.date);
    if (!bySlot) {
      bySlot = new Map();
      result.set(entry.date, bySlot);
    }
    const existing = bySlot.get(entry.meal_slot) ?? [];
    existing.push(entry);
    bySlot.set(entry.meal_slot, existing);
  }
  return result;
}

/** Get the Monday of the week containing a given date */
export function getWeekMonday(d: Date): Date {
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
}

/** Format a Date as YYYY-MM-DD */
export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get 7 dates starting from monday */
export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
