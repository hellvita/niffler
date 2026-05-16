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
    row.expenses.find(e => e.categoryName === name)?.amount ?? null;

  const handleImport = () => {
    setExecuteError(null);
    execute.mutate(mapping, {
      onSuccess: result => result && onImport(result),
      onError: () => setExecuteError('Import failed. Please try again.'),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        <span>Showing first {previewResult.preview.length} of {previewResult.totalDataRows} rows</span>
        {previewResult.skippedRows > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            {previewResult.skippedRows} rows were skipped (unparseable date format)
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
              <th className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">Date</th>
              {categoryNames.map(name => (
                <th key={name} className="px-3 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  {name}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">Income</th>
            </tr>
          </thead>
          <tbody>
            {previewResult.preview.map(row => (
              <tr key={row.date} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap font-mono tabular-nums">
                  {row.date}
                </td>
                {categoryNames.map(name => (
                  <td key={name} className="px-3 py-2 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                    {fmt(getExpense(row, name))}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                  {fmt(row.income)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {executeError && <p className="text-sm text-red-500">{executeError}</p>}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={execute.isPending}
          className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleImport}
          disabled={execute.isPending}
          className="px-6 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-40 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
          {execute.isPending ? 'Importing…' : 'Import'}
        </button>
      </div>
    </div>
  );
}
