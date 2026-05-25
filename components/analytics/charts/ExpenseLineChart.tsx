'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { computeMedian, type ChartDataPoint } from '@/lib/utils/aggregation';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';

export function ExpenseLineChart({ data }: { data: ChartDataPoint[] }) {
  const { preferences: prefs } = useColumnPreferences();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--color-text-muted)]">
        No data for this period.
      </div>
    );
  }

  const showIncome = prefs.income.visible;
  const showLimit = prefs.effectiveLimit.visible && data.some((d) => d.limit !== null);
  const showMedianLine = prefs.medianDailyExpenses.visible || prefs.medianMonthlyExpenses.visible;
  const median = showMedianLine
    ? computeMedian(data.map((d) => d.expenses).filter((v) => v > 0))
    : null;
  const chartData = median !== null ? data.map((d) => ({ ...d, median })) : data;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#52525b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#52525b' }} />
        <Tooltip
          formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
          labelStyle={{ color: '#18181b', fontWeight: 500 }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={prefs.totalExpenses.color!}
          dot={false}
          strokeWidth={2}
        />
        {showIncome && (
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke={prefs.income.color!}
            dot={false}
            strokeWidth={2}
          />
        )}
        {showLimit && (
          <Line
            type="stepAfter"
            dataKey="limit"
            name="Limit"
            stroke={prefs.effectiveLimit.color!}
            dot={false}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        )}
        {median !== null && (
          <Line
            type="monotone"
            dataKey="median"
            name="Median"
            stroke={prefs.medianDailyExpenses.color!}
            dot={false}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
