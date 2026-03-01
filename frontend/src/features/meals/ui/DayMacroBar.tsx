import type { MealPlanEntry } from '../domain/types';
import { sumMacros } from '../domain/meals';

export function DayMacroBar({ entries }: { entries: MealPlanEntry[] }): React.ReactElement {
  const totals = sumMacros(entries);
  return (
    <div className="flex items-center gap-3 text-xs text-text-muted">
      <span className="text-accent-muted">{Math.round(totals.calories)} kcal</span>
      <span className="text-success">P: {totals.protein_g.toFixed(1)}g</span>
      <span className="text-warning">C: {totals.carbs_g.toFixed(1)}g</span>
      <span className="text-danger">F: {totals.fat_g.toFixed(1)}g</span>
    </div>
  );
}
