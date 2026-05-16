'use client';
import { useState } from 'react';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';
import { COLUMN_ORDER, DEFAULT_COLUMN_PREFERENCES, type ColumnKey } from '@/lib/types/ui';

const FIELD_DESCRIPTIONS: Record<ColumnKey, string> = {
  totalExpenses:  'Total Expenses',
  income:         'Income',
  effectiveLimit: 'Daily Limit / Budget',
  limitDiff:      'Limit Diff',
  net:            'Net',
  currentBalance: 'Balance',
};

export function ColumnPreferencesForm() {
  const { preferences, updateLabel, toggleVisible, resetAll } = useColumnPreferences();
  const [editingKey, setEditingKey] = useState<ColumnKey | null>(null);
  const [editValue, setEditValue] = useState('');

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
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
              <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">Field</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">Display label</th>
              <th className="px-4 py-2 text-center font-medium text-zinc-500 dark:text-zinc-400">Visible</th>
            </tr>
          </thead>
          <tbody>
            {COLUMN_ORDER.map(key => (
              <tr key={key} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                  {FIELD_DESCRIPTIONS[key]}
                </td>
                <td className="px-4 py-2.5">
                  {editingKey === key ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit(key);
                        if (e.key === 'Escape') setEditingKey(null);
                      }}
                      onBlur={() => commitEdit(key)}
                      placeholder={DEFAULT_COLUMN_PREFERENCES[key].label}
                      className="w-36 px-2 py-0.5 text-sm rounded border border-blue-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(key)}
                      className="text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {preferences[key].label}
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={preferences[key].visible}
                    onChange={() => toggleVisible(key)}
                    className="rounded border-zinc-300 dark:border-zinc-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={resetAll}
        className="self-start text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline transition-colors"
      >
        Reset all to defaults
      </button>
    </div>
  );
}
