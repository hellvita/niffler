'use client';
import { DateNavigator } from '@/components/shared/DateNavigator';
import { DaySummaryBar } from '@/components/day/DaySummaryBar';
import { CategoryExpenseRow } from '@/components/day/CategoryExpenseRow';
import { IncomeRow } from '@/components/day/IncomeRow';
import { AddCategoryInline } from '@/components/day/AddCategoryInline';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDaySummary } from '@/lib/hooks/useSummary';

export function DayView({ date }: { date: string }) {
  const { data, isLoading, error, refetch } = useDaySummary(date);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <DateNavigator date={date} />
      <DaySummaryBar date={date} />

      <ul className="flex flex-col gap-2 list-none">
        {error ? (
          <li>
            <EmptyState
              message="Failed to load day data."
              action={{ label: 'Retry', onClick: refetch }}
            />
          </li>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-12" />
            </li>
          ))
        ) : (
          <>
            {data?.expensesByCategory.map((e) => (
              <li key={e.categoryId}>
                <CategoryExpenseRow
                  date={date}
                  categoryId={e.categoryId}
                  categoryName={e.categoryName}
                  amount={e.amount}
                />
              </li>
            ))}
            <li>
              <AddCategoryInline />
            </li>
            <li className="mt-2 border-t border-[var(--color-border)] pt-2">
              <IncomeRow date={date} income={data?.income ?? 0} />
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
