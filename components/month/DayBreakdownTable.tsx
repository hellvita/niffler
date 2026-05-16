'use client';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { useMonthSummary } from '@/lib/hooks/useSummary';

function fmt(value: number | null): string {
  return value === null ? '—' : value.toFixed(2);
}

export function DayBreakdownTable({ yearMonth }: { yearMonth: string }) {
  const router = useRouter();
  const { data, isLoading } = useMonthSummary(yearMonth);

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
            <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">Date</th>
            <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">Expenses</th>
            <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">Income</th>
            <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">Limit</th>
            <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">Limit Diff</th>
            <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">Net</th>
          </tr>
        </thead>
        <tbody>
          {data.days.map(day => {
            const isOverBudget = day.limitDiff !== null && day.limitDiff < 0;
            const isEmpty = day.totalExpenses === 0 && day.totalIncome === 0;

            return (
              <tr
                key={day.date}
                onClick={() => router.push(`/day/${day.date}`)}
                className={`cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors
                  ${isOverBudget
                    ? 'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }
                  ${isEmpty ? 'opacity-40' : ''}`}
              >
                <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                  {format(parseISO(day.date), 'EEE d')}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                  {day.totalExpenses > 0 ? day.totalExpenses.toFixed(2) : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                  {day.totalIncome > 0 ? day.totalIncome.toFixed(2) : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                  {fmt(day.effectiveLimit)}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                  isOverBudget ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'
                }`}>
                  {fmt(day.limitDiff)}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                  day.net < 0 ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'
                }`}>
                  {day.net.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
