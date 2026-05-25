'use client';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { useMonthSummary } from '@/lib/hooks/useSummary';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';

function fmt(value: number | null): string {
  return value === null ? '—' : value.toFixed(2);
}

export function DayBreakdownTable({ yearMonth }: { yearMonth: string }) {
  const router = useRouter();
  const { data, isLoading } = useMonthSummary(yearMonth);
  const { preferences: prefs } = useColumnPreferences();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-[var(--color-bg-secondary)] animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
            <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
              Date
            </th>
            {prefs.totalExpenses.visible && (
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                {prefs.totalExpenses.label}
              </th>
            )}
            {prefs.income.visible && (
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                {prefs.income.label}
              </th>
            )}
            {prefs.effectiveLimit.visible && (
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                {prefs.effectiveLimit.label}
              </th>
            )}
            {prefs.limitDiff.visible && (
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                {prefs.limitDiff.label}
              </th>
            )}
            {prefs.net.visible && (
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                {prefs.net.label}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.days.map((day) => {
            const isOverBudget = day.limitDiff !== null && day.limitDiff < 0;
            const isEmpty = day.totalExpenses === 0 && day.totalIncome === 0;

            return (
              <tr
                key={day.date}
                onClick={() => router.push(`/day/${day.date}`)}
                className={`cursor-pointer border-b border-[var(--color-border)] last:border-0 transition-colors
                  ${
                    isOverBudget
                      ? 'bg-[var(--color-error-bg)] hover:opacity-90'
                      : 'hover:bg-[var(--color-btn-secondary-hover)]'
                  }
                  ${isEmpty ? 'opacity-40' : ''}`}
              >
                <td className="px-4 py-2.5 text-[var(--color-text-secondary)] whitespace-nowrap">
                  {format(parseISO(day.date), 'EEE d')}
                </td>
                {prefs.totalExpenses.visible && (
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[var(--color-text-primary)]">
                    {day.totalExpenses > 0 ? day.totalExpenses.toFixed(2) : '—'}
                  </td>
                )}
                {prefs.income.visible && (
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[var(--color-text-primary)]">
                    {day.totalIncome > 0 ? day.totalIncome.toFixed(2) : '—'}
                  </td>
                )}
                {prefs.effectiveLimit.visible && (
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[var(--color-text-secondary)]">
                    {fmt(day.effectiveLimit)}
                  </td>
                )}
                {prefs.limitDiff.visible && (
                  <td
                    className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                      isOverBudget
                        ? 'text-[var(--color-error)] font-semibold'
                        : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {fmt(day.limitDiff)}
                  </td>
                )}
                {prefs.net.visible && (
                  <td
                    className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                      day.net < 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]'
                    }`}
                  >
                    {day.net.toFixed(2)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
