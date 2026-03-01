import React from 'react';
import type { DashboardWeight } from '../domain/types';

export function WeightDeltaBadge({ weight }: { weight: DashboardWeight }): React.ReactElement {
  if (weight.latest_kg === null) {
    return <p className="text-sm text-text-muted">No weight logged yet.</p>;
  }
  const delta = weight.delta_kg;
  const sign = delta !== null && delta > 0 ? '+' : '';
  const deltaClass =
    delta === null
      ? ''
      : delta > 0
        ? 'text-danger'
        : delta < 0
          ? 'text-success'
          : 'text-text-muted';

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-3xl font-bold text-text">{weight.latest_kg} kg</span>
      {delta !== null && (
        <span className={`text-sm font-medium ${deltaClass}`}>
          {sign}{delta} kg
        </span>
      )}
    </div>
  );
}
