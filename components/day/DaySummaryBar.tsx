'use client';
import { useDaySummary } from '@/lib/hooks/useSummary';

export function DaySummaryBar({ date }: { date: string }) {
  const { data, isLoading } = useDaySummary(date);

  if (isLoading) {
    return <div className="h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  }
  if (!data) return null;

  const items = [
    { label: 'Expenses', value: data.totalExpenses },
    { label: 'Income', value: data.income },
    ...(data.limitDiff !== null
      ? [{ label: 'Limit Diff', value: data.limitDiff }]
      : []),
    { label: 'Net', value: data.net },
  ];

  return (
    <div className="flex gap-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-6 py-4">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            {label}
          </span>
          <span
            className={`text-xl font-semibold tabular-nums ${
              value < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
