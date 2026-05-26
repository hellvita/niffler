'use client';
import { useState } from 'react';
import { useExecuteImport } from '@/lib/hooks/useImport';
import { Button } from '@/components/shared/Button';
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
          <span className="text-[var(--color-warning)]">
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
        <Button variant="secondary" onClick={onBack} disabled={execute.isPending}>
          Back
        </Button>
        <Button variant="primary" loading={execute.isPending} onClick={handleImport}>
          Import
        </Button>
      </div>
    </div>
  );
}
