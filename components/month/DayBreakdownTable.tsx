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
          <div key={i} className="h-10 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
            <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
              Date
            </th>
            {prefs.totalExpenses.visible && (
              <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                {prefs.totalExpenses.label}
              </th>
            )}
            {prefs.income.visible && (
              <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                {prefs.income.label}
              </th>
            )}
            {prefs.effectiveLimit.visible && (
              <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                {prefs.effectiveLimit.label}
              </th>
            )}
            {prefs.limitDiff.visible && (
              <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                {prefs.limitDiff.label}
              </th>
            )}
            {prefs.net.visible && (
              <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
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
                className={`cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors
                  ${
                    isOverBudget
                      ? 'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }
                  ${isEmpty ? 'opacity-40' : ''}`}
              >
                <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                  {format(parseISO(day.date), 'EEE d')}
                </td>
                {prefs.totalExpenses.visible && (
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                    {day.totalExpenses > 0 ? day.totalExpenses.toFixed(2) : '—'}
                  </td>
                )}
                {prefs.income.visible && (
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                    {day.totalIncome > 0 ? day.totalIncome.toFixed(2) : '—'}
                  </td>
                )}
                {prefs.effectiveLimit.visible && (
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                    {fmt(day.effectiveLimit)}
                  </td>
                )}
                {prefs.limitDiff.visible && (
                  <td
                    className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                      isOverBudget
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {fmt(day.limitDiff)}
                  </td>
                )}
                {prefs.net.visible && (
                  <td
                    className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                      day.net < 0 ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'
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
