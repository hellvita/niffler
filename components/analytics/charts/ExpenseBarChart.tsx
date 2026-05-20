'use client';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '@/lib/utils/aggregation';

export function ExpenseBarChart({ data }: { data: ChartDataPoint[] }) {
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
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#52525b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#52525b' }} />
        <Tooltip
          formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
          labelStyle={{ color: '#18181b', fontWeight: 500 }}
        />
        <Legend />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[2, 2, 0, 0]} />
        {hasLimit && (
          <Line
            type="stepAfter"
            dataKey="limit"
            name="Limit"
            stroke="#f59e0b"
            dot={false}
            strokeDasharray="4 4"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
