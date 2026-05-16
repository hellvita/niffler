'use client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import type { ImportResult } from '@/lib/types/api';

export function ImportResultSummary({
  result,
  onReset,
}: {
  result: ImportResult;
  onReset: () => void;
}) {
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Import complete</h2>

        <ul className="flex flex-col gap-1.5">
          <li className="text-sm text-zinc-700 dark:text-zinc-300">
            ✓ <strong className="font-semibold">{result.daysImported}</strong> days imported
          </li>
          <li className="text-sm text-zinc-700 dark:text-zinc-300">
            ✓ <strong className="font-semibold">{result.expensesUpserted}</strong> expense entries written
          </li>
          <li className="text-sm text-zinc-700 dark:text-zinc-300">
            ✓ <strong className="font-semibold">{result.incomesUpserted}</strong> income entries written
          </li>
          <li className="text-sm text-zinc-700 dark:text-zinc-300">
            ✓ <strong className="font-semibold">{result.rowsSkipped}</strong> rows skipped (invalid date)
          </li>
        </ul>

        {result.categoriesCreated.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">New categories created:</p>
            <ul className="flex flex-col gap-0.5">
              {result.categoriesCreated.map(name => (
                <li key={name} className="text-sm text-zinc-700 dark:text-zinc-300 pl-3">
                  • {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/day/${today}`)}
          className="px-5 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
          Go to today
        </button>
        <button
          onClick={onReset}
          className="px-5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Import another file
        </button>
      </div>
    </div>
  );
}
