'use client';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { computeMedian, type ChartDataPoint } from '@/lib/utils/aggregation';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';

export function ExpenseBarChart({ data }: { data: ChartDataPoint[] }) {
  const { preferences: prefs } = useColumnPreferences();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-zinc-400 dark:text-zinc-500">
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
      <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#52525b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#52525b' }} />
        <Tooltip
          formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
          labelStyle={{ color: '#18181b', fontWeight: 500 }}
        />
        <Legend />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill={prefs.totalExpenses.color!}
          radius={[2, 2, 0, 0]}
        />
        {showIncome && (
          <Bar dataKey="income" name="Income" fill={prefs.income.color!} radius={[2, 2, 0, 0]} />
        )}
        {showLimit && (
          <Line
            type="stepAfter"
            dataKey="limit"
            name="Limit"
            stroke={prefs.effectiveLimit.color!}
            dot={false}
            strokeDasharray="4 4"
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
      </ComposedChart>
    </ResponsiveContainer>
  );
}
