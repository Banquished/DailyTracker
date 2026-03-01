import { useMemo } from 'react';
import type { Habit } from '../domain/types';
import { buildCommitGrid, formatDate, getCellIntensity } from '../domain/habits';

type CommitGridProps = {
  habit: Habit;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Returns a CSS background color string for a given intensity and hex color. */
function cellColor(hexColor: string, intensity: 0 | 1 | 2 | 3 | 4): string {
  if (intensity === 0) return 'var(--color-border-subtle)';
  const opacities: Record<1 | 2 | 3 | 4, string> = {
    1: '33', // ~20%
    2: '66', // ~40%
    3: 'b3', // ~70%
    4: 'ff', // 100%
  };
  // hexColor is like #2563eb — append alpha suffix
  const base = hexColor.replace('#', '');
  return `#${base}${opacities[intensity]}`;
}

export function CommitGrid({ habit }: CommitGridProps): React.ReactElement {
  const today = new Date();
  const todayStr = formatDate(today);

  const weeks = useMemo(() => buildCommitGrid(habit, today), [habit, todayStr]);

  // Build month label positions: when the month changes at the start of a week,
  // record { weekIndex, label }.
  const monthLabels = useMemo(() => {
    const labels: Array<{ weekIndex: number; label: string }> = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstCell = week[0];
      if (firstCell) {
        const month = new Date(firstCell.date + 'T00:00:00').getMonth();
        if (month !== lastMonth) {
          labels.push({ weekIndex: wi, label: MONTH_LABELS[month] ?? '' });
          lastMonth = month;
        }
      }
    });
    return labels;
  }, [weeks]);

  const labelMap = new Map(monthLabels.map((l) => [l.weekIndex, l.label]));

  return (
    <div className="overflow-x-auto">
      {/* Month labels row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(52, 13px)`,
          gap: '2px',
          marginBottom: '4px',
        }}
      >
        {weeks.map((_week, wi) => (
          <div
            key={wi}
            style={{
              height: '12px',
              fontSize: '9px',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}
          >
            {labelMap.get(wi) ?? ''}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(52, 13px)`,
          gap: '2px',
        }}
        role="grid"
        aria-label={`${habit.name} activity grid`}
      >
        {weeks.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(7, 11px)`,
              gap: '2px',
            }}
            role="row"
          >
            {week.map((cell, di) => {
              const intensity = getCellIntensity(habit, cell.log);
              const isFuture = cell.date > todayStr;
              const isToday = cell.date === todayStr;

              const bgColor = isFuture
                ? 'var(--color-border-subtle)'
                : cellColor(habit.color, intensity);

              let tooltipText: string;
              if (cell.log === null) {
                tooltipText = `${cell.date}: no log`;
              } else if (cell.log.completed) {
                tooltipText =
                  habit.type === 'count' && cell.log.count !== null
                    ? `${cell.date}: ${cell.log.count} / ${habit.target_count ?? '?'}`
                    : `${cell.date}: done`;
              } else {
                tooltipText = `${cell.date}: skipped`;
              }

              return (
                <div
                  key={di}
                  role="gridcell"
                  title={tooltipText}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 2,
                    backgroundColor: bgColor,
                    opacity: isFuture ? 0.25 : 1,
                    outline: isToday ? `2px solid var(--color-text)` : undefined,
                    outlineOffset: isToday ? '1px' : undefined,
                    flexShrink: 0,
                  }}
                  aria-label={tooltipText}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
