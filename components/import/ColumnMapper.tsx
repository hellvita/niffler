'use client';
import { useState } from 'react';
import { usePreviewImport } from '@/lib/hooks/useImport';
import { columnMappingSchema } from '@/lib/validation/schemas';
import { TransformOptions } from './TransformOptions';
import type { ParsedColumn, ParseResult, ColumnMapping, PreviewResult } from '@/lib/types/api';

function colLabel(col: ParsedColumn): string {
  const sample = col.samples[0];
  return `${col.letter} — ${col.header}${sample ? `  (sample: ${sample})` : ''}`;
}

interface Props {
  parseResult: ParseResult;
  initialMapping?: Partial<ColumnMapping>;
  onPreview: (mapping: ColumnMapping, result: PreviewResult) => void;
  onBack: () => void;
}

export function ColumnMapper({ parseResult, initialMapping, onPreview, onBack }: Props) {
  const cols = parseResult.columns;
  const firstIndex = cols[0]?.index ?? 0;

  const [dateColumnIndex, setDateColumnIndex] = useState(
    initialMapping?.dateColumnIndex ?? firstIndex
  );
  const [categoryColumnIndexes, setCategoryColumnIndexes] = useState<number[]>(
    initialMapping?.categoryColumnIndexes ?? []
  );
  const [incomeColumnIndex, setIncomeColumnIndex] = useState(
    initialMapping?.incomeColumnIndex ?? firstIndex
  );
  const [scaleFactor, setScaleFactor] = useState(initialMapping?.scaleFactor ?? 1);
  const [invertSign, setInvertSign] = useState(initialMapping?.invertSign ?? false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const preview = usePreviewImport();

  const handleDateChange = (index: number) => {
    setDateColumnIndex(index);
    setCategoryColumnIndexes((prev) => prev.filter((i) => i !== index));
  };

  const handleIncomeChange = (index: number) => {
    setIncomeColumnIndex(index);
    setCategoryColumnIndexes((prev) => prev.filter((i) => i !== index));
  };

  const toggleCategory = (index: number) => {
    setCategoryColumnIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handlePreview = () => {
    const validation = columnMappingSchema.safeParse({
      dateColumnIndex,
      categoryColumnIndexes,
      incomeColumnIndex,
      scaleFactor,
      invertSign,
    });
    if (!validation.success) {
      setValidationError(validation.error.issues[0]?.message ?? 'Please complete all fields');
      return;
    }
    setValidationError(null);
    setApiError(null);

    const mapping: ColumnMapping = {
      fileId: parseResult.fileId,
      dateColumnIndex,
      categoryColumnIndexes,
      incomeColumnIndex,
      scaleFactor,
      invertSign,
    };

    preview.mutate(mapping, {
      onSuccess: (result) => result && onPreview(mapping, result),
      onError: () => setApiError('Failed to generate preview. Please try again.'),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)] w-44">
                Role
              </th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                Column(s) from your file
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--color-border)]">
              <td className="px-4 py-3 text-[var(--color-text-primary)] font-medium">Date</td>
              <td className="px-4 py-3">
                <select
                  value={dateColumnIndex}
                  onChange={(e) => handleDateChange(Number(e.target.value))}
                  className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-[var(--color-btn-secondary-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
                >
                  {cols.map((c) => (
                    <option key={c.index} value={c.index}>
                      {colLabel(c)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            <tr className="border-b border-[var(--color-border)]">
              <td className="px-4 py-3 text-[var(--color-text-primary)] font-medium align-top">
                Expense categories
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {cols.map((c) => {
                    const disabled = c.index === dateColumnIndex || c.index === incomeColumnIndex;
                    const checked = categoryColumnIndexes.includes(c.index);
                    return (
                      <button
                        key={c.index}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && toggleCategory(c.index)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          disabled
                            ? 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed'
                            : checked
                              ? 'border-[var(--color-btn-primary-bg)] bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)]'
                              : 'border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:border-[var(--color-border-strong)]'
                        }`}
                      >
                        {c.letter} — {c.header}
                      </button>
                    );
                  })}
                </div>
              </td>
            </tr>

            <tr>
              <td className="px-4 py-3 text-[var(--color-text-primary)] font-medium">Income</td>
              <td className="px-4 py-3">
                <select
                  value={incomeColumnIndex}
                  onChange={(e) => handleIncomeChange(Number(e.target.value))}
                  className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-[var(--color-btn-secondary-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
                >
                  {cols.map((c) => (
                    <option key={c.index} value={c.index}>
                      {colLabel(c)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <TransformOptions
        scaleFactor={scaleFactor}
        invertSign={invertSign}
        onScaleChange={setScaleFactor}
        onInvertChange={setInvertSign}
      />

      {validationError && <p className="text-sm text-[var(--color-error)]">{validationError}</p>}
      {apiError && <p className="text-sm text-[var(--color-error)]">{apiError}</p>}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handlePreview}
          disabled={preview.isPending}
          className="px-6 py-2 text-sm rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium disabled:opacity-40 transition-colors hover:bg-[var(--color-btn-primary-hover)]"
        >
          {preview.isPending ? 'Loading preview…' : 'Preview →'}
        </button>
      </div>
    </div>
  );
}
