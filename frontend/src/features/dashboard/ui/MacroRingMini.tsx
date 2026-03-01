import React from 'react';
import type { DashboardMacros } from '../domain/types';

type MacroBarProps = { label: string; actual: number; goal: number; unit: string; color: string };

function MacroBar({ label, actual, goal, unit, color }: MacroBarProps): React.ReactElement {
  const pct = Math.min(100, goal > 0 ? (actual / goal) * 100 : 0);
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-text-muted">{label}</span>
        <span className="text-text">{Math.round(actual)}/{goal} {unit}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function MacroRingMini({ macros }: { macros: DashboardMacros }): React.ReactElement {
  return (
    <div className="space-y-2">
      <MacroBar label="Calories" actual={macros.actual_calories} goal={macros.goal_calories} unit="kcal" color="#2563eb" />
      <MacroBar label="Protein" actual={macros.actual_protein_g} goal={macros.goal_protein_g} unit="g" color="#22c55e" />
      <MacroBar label="Carbs" actual={macros.actual_carbs_g} goal={macros.goal_carbs_g} unit="g" color="#fbbf24" />
      <MacroBar label="Fat" actual={macros.actual_fat_g} goal={macros.goal_fat_g} unit="g" color="#ef4444" />
    </div>
  );
}
