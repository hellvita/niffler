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
      <div className="flex flex-col gap-4 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Import complete
        </h2>

        <ul className="flex flex-col gap-1.5">
          <li className="text-sm text-[var(--color-text-primary)]">
            ✓ <strong className="font-semibold">{result.daysImported}</strong> days imported
          </li>
          <li className="text-sm text-[var(--color-text-primary)]">
            ✓ <strong className="font-semibold">{result.expensesUpserted}</strong> expense entries
            written
          </li>
          <li className="text-sm text-[var(--color-text-primary)]">
            ✓ <strong className="font-semibold">{result.incomesUpserted}</strong> income entries
            written
          </li>
          <li className="text-sm text-[var(--color-text-primary)]">
            ✓ <strong className="font-semibold">{result.rowsSkipped}</strong> rows skipped (invalid
            date)
          </li>
        </ul>

        {result.categoriesCreated.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              New categories created:
            </p>
            <ul className="flex flex-col gap-0.5">
              {result.categoriesCreated.map((name) => (
                <li key={name} className="text-sm text-[var(--color-text-primary)] pl-3">
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
          className="px-5 py-2 text-sm rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium transition-colors hover:bg-[var(--color-btn-primary-hover)]"
        >
          Go to today
        </button>
        <button
          onClick={onReset}
          className="px-5 py-2 text-sm rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
        >
          Import another file
        </button>
      </div>
    </div>
  );
}
