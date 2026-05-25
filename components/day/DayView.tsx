'use client';
import { DateNavigator } from '@/components/shared/DateNavigator';
import { DaySummaryBar } from '@/components/day/DaySummaryBar';
import { CategoryExpenseRow } from '@/components/day/CategoryExpenseRow';
import { IncomeRow } from '@/components/day/IncomeRow';
import { AddCategoryInline } from '@/components/day/AddCategoryInline';
import { useDaySummary } from '@/lib/hooks/useSummary';

export function DayView({ date }: { date: string }) {
  const { data, isLoading, error, refetch } = useDaySummary(date);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <DateNavigator date={date} />
      <DaySummaryBar date={date} />

      <div className="flex flex-col gap-2">
        {error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-[var(--color-text-secondary)]">
            <p className="text-sm">Failed to load day data.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded border border-[var(--color-btn-secondary-border)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors text-[var(--color-btn-secondary-text)]"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-[var(--color-bg-secondary)] animate-pulse" />
          ))
        ) : (
          <>
            {data?.expensesByCategory.map((e) => (
              <CategoryExpenseRow
                key={e.categoryId}
                date={date}
                categoryId={e.categoryId}
                categoryName={e.categoryName}
                amount={e.amount}
              />
            ))}
            <AddCategoryInline />

            <div className="mt-2 border-t border-[var(--color-border)] pt-2">
              <IncomeRow date={date} income={data?.income ?? 0} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
