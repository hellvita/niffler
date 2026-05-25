'use client';
import { useState } from 'react';
import { useExecuteImport } from '@/lib/hooks/useImport';
import type { ColumnMapping, PreviewResult, ImportResult, PreviewRow } from '@/lib/types/api';

function fmt(v: number | null): string {
  return v === null || v === 0 ? '—' : v.toFixed(2);
}

interface Props {
  mapping: ColumnMapping;
  previewResult: PreviewResult;
  onImport: (result: ImportResult) => void;
  onBack: () => void;
}

export function ImportPreviewTable({ mapping, previewResult, onImport, onBack }: Props) {
  const [executeError, setExecuteError] = useState<string | null>(null);
  const execute = useExecuteImport();

  // Collect unique category names in order of first appearance
  const categoryNames: string[] = [];
  const seen = new Set<string>();
  for (const row of previewResult.preview) {
    for (const exp of row.expenses) {
      if (!seen.has(exp.categoryName)) {
        seen.add(exp.categoryName);
        categoryNames.push(exp.categoryName);
      }
    }
  }

  const getExpense = (row: PreviewRow, name: string): number | null =>
    row.expenses.find((e) => e.categoryName === name)?.amount ?? null;

  const handleImport = () => {
    setExecuteError(null);
    execute.mutate(mapping, {
      onSuccess: (result) => result && onImport(result),
      onError: () => setExecuteError('Import failed. Please try again.'),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-sm text-[var(--color-text-secondary)]">
        <span>
          Showing first {previewResult.preview.length} of {previewResult.totalDataRows} rows
        </span>
        {previewResult.skippedRows > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            {previewResult.skippedRows} rows were skipped (unparseable date format)
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                Date
              </th>
              {categoryNames.map((name) => (
                <th
                  key={name}
                  className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]"
                >
                  {name}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                Income
              </th>
            </tr>
          </thead>
          <tbody>
            {previewResult.preview.map((row) => (
              <tr key={row.date} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-2 text-[var(--color-text-secondary)] whitespace-nowrap font-mono tabular-nums">
                  {row.date}
                </td>
                {categoryNames.map((name) => (
                  <td
                    key={name}
                    className="px-3 py-2 text-right font-mono tabular-nums text-[var(--color-text-primary)]"
                  >
                    {fmt(getExpense(row, name))}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-mono tabular-nums text-[var(--color-text-primary)]">
                  {fmt(row.income)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {executeError && <p className="text-sm text-[var(--color-error)]">{executeError}</p>}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={execute.isPending}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] disabled:opacity-40 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleImport}
          disabled={execute.isPending}
          className="px-6 py-2 text-sm rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium disabled:opacity-40 transition-colors hover:bg-[var(--color-btn-primary-hover)]"
        >
          {execute.isPending ? 'Importing…' : 'Import'}
        </button>
      </div>
    </div>
  );
}
