import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WeightEntry } from '../domain/types';

type ChartPoint = {
  date: string;
  weight: number;
};

type Props = {
  entries: WeightEntry[];
};

function abbreviateDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD — display as "Jan 5", "Feb 12" etc.
  const [, month, day] = dateStr.split('-');
  if (!month || !day) return dateStr;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = parseInt(month, 10) - 1;
  const d = parseInt(day, 10);
  return `${monthNames[m] ?? month} ${d}`;
}

export function WeightChart({ entries }: Props): React.ReactElement {
  const data: ChartPoint[] = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, weight: e.weight_kg }));

  if (data.length === 0) {
    return (
      <div
        className="card card-padding flex items-center justify-center"
        style={{ minHeight: '200px' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No weight entries yet. Log your first entry above.
        </p>
      </div>
    );
  }

  return (
    <div className="card card-padding">
      <h3 className="mb-4 text-base font-semibold">Weight Over Time</h3>
      <ResponsiveContainer width="100%" height={280} style={{ background: 'transparent' }}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={abbreviateDate}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-border-subtle)' }}
            tickLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              color: 'var(--color-text)',
              fontSize: '13px',
            }}
            labelFormatter={(label: unknown) =>
              typeof label === 'string' ? abbreviateDate(label) : String(label)
            }
            formatter={(value: number | undefined) => [
              value !== undefined ? `${value} kg` : '',
              'Weight',
            ]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-accent)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
