'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { computeMedian, type ChartDataPoint } from '@/lib/utils/aggregation';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';
import { useRechartsTheme } from '@/lib/hooks/useRechartsTheme';
import { EmptyState } from '@/components/shared/EmptyState';

export function ExpenseLineChart({ data }: { data: ChartDataPoint[] }) {
  const { preferences: prefs } = useColumnPreferences();
  const theme = useRechartsTheme();

  if (data.length === 0) {
    return <EmptyState message="No data for this period." className="h-64" />;
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
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.axis }} />
        <YAxis tick={{ fontSize: 11, fill: theme.axis }} />
        <Tooltip
          formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
          contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border }}
          labelStyle={{ color: theme.text, fontWeight: 500 }}
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
