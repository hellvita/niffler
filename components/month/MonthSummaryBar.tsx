'use client';
import { useMonthSummary } from '@/lib/hooks/useSummary';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';
import { computeMedian } from '@/lib/utils/aggregation';
import { Skeleton } from '@/components/shared/Skeleton';

export function MonthSummaryBar({ yearMonth }: { yearMonth: string }) {
  const { data, isLoading } = useMonthSummary(yearMonth);
  const { preferences: prefs } = useColumnPreferences();

  if (isLoading) {
    return <Skeleton className="h-20" />;
  }
  if (!data) return null;

  const hasAnyLimit = data.days.some((d) => d.effectiveLimit !== null);

  const medianDailyExpenses = computeMedian(
    data.days.map((d) => d.totalExpenses).filter((v) => v > 0)
  );

  const items = [
    { key: 'totalExpenses' as const, value: data.monthTotals.totalExpenses },
    { key: 'medianDailyExpenses' as const, value: medianDailyExpenses },
    { key: 'income' as const, value: data.monthTotals.totalIncome },
    {
      key: 'effectiveLimit' as const,
      value: hasAnyLimit ? data.monthTotals.allowedMonthlyBudget : null,
    },
    { key: 'limitDiff' as const, value: hasAnyLimit ? data.monthTotals.totalLimitDiff : null },
    { key: 'net' as const, value: data.monthTotals.net },
  ]
    .filter((item) => prefs[item.key].visible)
    .map((item) => ({ ...item, label: prefs[item.key].label }));

  return (
    <dl className="flex gap-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-4">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            {label}
          </dt>
          <dd
            className={`text-xl font-semibold tabular-nums ${
              value === null
                ? 'text-[var(--color-text-muted)]'
                : value < 0
                  ? 'text-[var(--color-error)]'
                  : 'text-[var(--color-text-primary)]'
            }`}
          >
            {value === null ? '—' : value.toFixed(2)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
