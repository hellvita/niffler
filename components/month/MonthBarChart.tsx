'use client';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { parseISO } from 'date-fns';
import { useMonthSummary } from '@/lib/hooks/useSummary';

export function MonthBarChart({ yearMonth }: { yearMonth: string }) {
  const { data, isLoading } = useMonthSummary(yearMonth);
  const router = useRouter();

  if (isLoading) {
    return <div className="h-48 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  }
  if (!data) return null;

  const hasLimit = data.days.some((d) => d.effectiveLimit !== null);

  const chartData = data.days.map((d) => ({
    day: parseISO(d.date).getDate(),
    date: d.date,
    expenses: d.totalExpenses,
    limit: d.effectiveLimit,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#52525b' }} interval={2} />
        <YAxis tick={{ fontSize: 10, fill: '#52525b' }} width={40} />
        <Tooltip
          formatter={(v, name) => [typeof v === 'number' ? v.toFixed(2) : String(v), name]}
          labelFormatter={(label) => `Day ${label}`}
          labelStyle={{ color: '#18181b', fontWeight: 500 }}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill="#3b82f6"
          radius={[2, 2, 0, 0]}
          cursor="pointer"
          onClick={(entry) => {
            const date = (entry as { date?: string }).date;
            if (date) router.push(`/day/${date}`);
          }}
        />
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
      </ComposedChart>
    </ResponsiveContainer>
  );
}
