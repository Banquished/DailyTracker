import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { DailyMacros, MacroProfile } from '../domain/types';

type Props = {
  daily: DailyMacros;
  profile: MacroProfile;
};

type MacroRow = {
  name: string;
  value: number;
  fill: string;
  actual: number;
  goal: number;
  unit: string;
};

function pct(actual: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.round((actual / goal) * 100), 100);
}

export function MacroRingChart({ daily, profile }: Props): React.ReactElement {
  const rows: MacroRow[] = [
    {
      name: 'Calories',
      value: pct(daily.calories, profile.calories),
      fill: '#2563eb',
      actual: daily.calories,
      goal: profile.calories,
      unit: 'kcal',
    },
    {
      name: 'Protein',
      value: pct(daily.protein_g, profile.protein_g),
      fill: '#22c55e',
      actual: daily.protein_g,
      goal: profile.protein_g,
      unit: 'g',
    },
    {
      name: 'Carbs',
      value: pct(daily.carbs_g, profile.carbs_g),
      fill: '#fbbf24',
      actual: daily.carbs_g,
      goal: profile.carbs_g,
      unit: 'g',
    },
    {
      name: 'Fat',
      value: pct(daily.fat_g, profile.fat_g),
      fill: '#ef4444',
      actual: daily.fat_g,
      goal: profile.fat_g,
      unit: 'g',
    },
  ];

  return (
    <div className="card card-padding">
      <h3 className="mb-4 text-base font-semibold">Today's Macros</h3>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Radial chart */}
        <div style={{ width: '100%', maxWidth: 300, height: 260, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%" style={{ background: 'transparent' }}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={rows}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                background={{ fill: 'var(--color-border-subtle)' }}
                cornerRadius={4}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--color-text)',
                  fontSize: '13px',
                }}
                formatter={(value: number | undefined, name: string | undefined) => [
                  value !== undefined ? `${value}%` : '',
                  name ?? '',
                ]}
              />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-muted)' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Text breakdown */}
        <div className="flex flex-col gap-3 flex-1">
          {rows.map((row) => (
            <div key={row.name} className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                style={{ background: row.fill }}
              />
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{row.name}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {row.actual} / {row.goal} {row.unit}
                  </span>
                </div>
                <div
                  className="mt-1 h-1.5 w-full rounded-full overflow-hidden"
                  style={{ background: 'var(--color-border-subtle)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${row.value}%`,
                      background: row.fill,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
