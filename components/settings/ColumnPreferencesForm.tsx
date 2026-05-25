'use client';
import { useRef, useState } from 'react';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';
import { COLUMN_ORDER, DEFAULT_COLUMN_PREFERENCES, type ColumnKey } from '@/lib/types/ui';

const FIELD_DESCRIPTIONS: Record<ColumnKey, string> = {
  totalExpenses: 'Total Expenses',
  medianDailyExpenses: 'Median Daily Expenses',
  medianMonthlyExpenses: 'Median Monthly Expenses',
  income: 'Income',
  effectiveLimit: 'Daily Limit / Budget',
  limitDiff: 'Limit Diff',
  net: 'Net',
  currentBalance: 'Balance',
};

export function ColumnPreferencesForm() {
  const { preferences, updateLabel, updateColor, toggleVisible, resetAll } = useColumnPreferences();
  const [editingKey, setEditingKey] = useState<ColumnKey | null>(null);
  const [editValue, setEditValue] = useState('');

  const colorRefTotalExpenses = useRef<HTMLInputElement>(null);
  const colorRefMedianDailyExpenses = useRef<HTMLInputElement>(null);
  const colorRefMedianMonthlyExpenses = useRef<HTMLInputElement>(null);
  const colorRefIncome = useRef<HTMLInputElement>(null);
  const colorRefEffectiveLimit = useRef<HTMLInputElement>(null);
  const colorRefs: Partial<Record<ColumnKey, React.RefObject<HTMLInputElement | null>>> = {
    totalExpenses: colorRefTotalExpenses,
    medianDailyExpenses: colorRefMedianDailyExpenses,
    medianMonthlyExpenses: colorRefMedianMonthlyExpenses,
    income: colorRefIncome,
    effectiveLimit: colorRefEffectiveLimit,
  };

  const startEdit = (key: ColumnKey) => {
    setEditingKey(key);
    setEditValue(preferences[key].label);
  };

  const commitEdit = (key: ColumnKey) => {
    updateLabel(key, editValue);
    setEditingKey(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                Field
              </th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                Display label
              </th>
              <th className="px-4 py-2 text-center font-medium text-[var(--color-text-secondary)]">
                Color
              </th>
              <th className="px-4 py-2 text-center font-medium text-[var(--color-text-secondary)]">
                Visible
              </th>
            </tr>
          </thead>
          <tbody>
            {COLUMN_ORDER.map((key) => (
              <tr key={key} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">
                  {FIELD_DESCRIPTIONS[key]}
                </td>
                <td className="px-4 py-2.5">
                  {editingKey === key ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(key);
                        if (e.key === 'Escape') setEditingKey(null);
                      }}
                      onBlur={() => commitEdit(key)}
                      placeholder={DEFAULT_COLUMN_PREFERENCES[key].label}
                      className="w-36 px-2 py-0.5 text-sm rounded border border-[var(--color-focus-ring)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(key)}
                      className="text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors"
                    >
                      {preferences[key].label}
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {preferences[key].color !== undefined ? (
                    <>
                      <button
                        type="button"
                        onClick={() => colorRefs[key]!.current?.click()}
                        style={{ backgroundColor: preferences[key].color }}
                        className="w-3.5 h-3.5 rounded ring-1 ring-[var(--color-border)] inline-block"
                        aria-label="Pick color"
                      />
                      <input
                        ref={colorRefs[key]}
                        type="color"
                        value={preferences[key].color}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="sr-only"
                      />
                    </>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={preferences[key].visible}
                    onChange={() => toggleVisible(key)}
                    className="rounded border-[var(--color-btn-secondary-border)]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={resetAll}
        className="self-start text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline transition-colors"
      >
        Reset all to defaults
      </button>
    </div>
  );
}
