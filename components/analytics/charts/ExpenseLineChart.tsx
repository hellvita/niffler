'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '@/lib/utils/aggregation';

export function ExpenseLineChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-zinc-400 dark:text-zinc-500">
        No data for this period.
      </div>
    );
  }

  const hasLimit = data.some(d => d.limit !== null);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#52525b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#52525b' }} />
        <Tooltip
          formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
          labelStyle={{ color: '#18181b', fontWeight: 500 }}
        />
        <Legend />
        <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" dot={false} strokeWidth={2} />
        {hasLimit && (
          <Line
            type="stepAfter"
            dataKey="limit"
            name="Limit"
            stroke="#f59e0b"
            dot={false}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
