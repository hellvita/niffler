'use client';
import { MonthNavigator } from '@/components/month/MonthNavigator';
import { MonthSummaryBar } from '@/components/month/MonthSummaryBar';
import { DayBreakdownTable } from '@/components/month/DayBreakdownTable';
import { useMonthSummary } from '@/lib/hooks/useSummary';

function CategoryBreakdown({ yearMonth }: { yearMonth: string }) {
  const { data, isLoading } = useMonthSummary(yearMonth);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const categories = data?.monthTotals.expensesByCategory.filter(c => c.amount > 0) ?? [];
  if (categories.length === 0) return null;

  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col gap-1">
      {[...categories]
        .sort((a, b) => b.amount - a.amount)
        .map(c => {
          const pct = total > 0 ? (c.amount / total) * 100 : 0;
          return (
            <div key={c.categoryId} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">
                {c.categoryName}
              </span>
              <div className="w-24 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-20 text-right text-sm font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                {c.amount.toFixed(2)}
              </span>
            </div>
          );
        })}
    </div>
  );
}

export function MonthView({ yearMonth }: { yearMonth: string }) {
  const { error, refetch } = useMonthSummary(yearMonth);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        <MonthNavigator yearMonth={yearMonth} />
        <div className="flex flex-col items-center gap-3 py-12 text-zinc-500">
          <p className="text-sm">Failed to load month data.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <MonthNavigator yearMonth={yearMonth} />
      <MonthSummaryBar yearMonth={yearMonth} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          By category
        </h2>
        <CategoryBreakdown yearMonth={yearMonth} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Day by day
        </h2>
        <DayBreakdownTable yearMonth={yearMonth} />
      </section>
    </div>
  );
}
