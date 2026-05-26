'use client';
import { useDaySummary } from '@/lib/hooks/useSummary';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';
import { Skeleton } from '@/components/shared/Skeleton';

export function DaySummaryBar({ date }: { date: string }) {
  const { data, isLoading } = useDaySummary(date);
  const { preferences: prefs } = useColumnPreferences();

  if (isLoading) {
    return <Skeleton className="h-20" />;
  }
  if (!data) return null;

  const items = [
    { key: 'totalExpenses' as const, value: data.totalExpenses },
    { key: 'income' as const, value: data.income },
    ...(data.limitDiff !== null ? [{ key: 'limitDiff' as const, value: data.limitDiff }] : []),
    { key: 'net' as const, value: data.net },
  ]
    .filter((item) => prefs[item.key].visible)
    .map((item) => ({ ...item, label: prefs[item.key].label }));

  return (
    <div className="flex gap-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-4">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            {label}
          </span>
          <span
            className={`text-xl font-semibold tabular-nums ${
              value < 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]'
            }`}
          >
            {value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
