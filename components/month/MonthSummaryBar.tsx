'use client';
import { useMonthSummary } from '@/lib/hooks/useSummary';

export function MonthSummaryBar({ yearMonth }: { yearMonth: string }) {
  const { data, isLoading } = useMonthSummary(yearMonth);

  if (isLoading) {
    return <div className="h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  }
  if (!data) return null;

  // Display "—" for budget when no limit has ever been set for any day in the month.
  // Do NOT use allowedMonthlyBudget === 0 as the signal — $0 is a valid configured limit.
  const hasAnyLimit = data.days.some(d => d.effectiveLimit !== null);

  const items = [
    { label: 'Expenses',   value: data.monthTotals.totalExpenses },
    { label: 'Income',     value: data.monthTotals.totalIncome },
    { label: 'Budget',     value: hasAnyLimit ? data.monthTotals.allowedMonthlyBudget : null },
    { label: 'Limit Diff', value: hasAnyLimit ? data.monthTotals.totalLimitDiff : null },
    { label: 'Net',        value: data.monthTotals.net },
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
              value === null
                ? 'text-zinc-400 dark:text-zinc-600'
                : value < 0
                  ? 'text-red-500'
                  : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {value === null ? '—' : value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
