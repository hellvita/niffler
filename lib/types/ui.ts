export type ColumnKey =
  | 'income'
  | 'totalExpenses'
  | 'medianDailyExpenses'
  | 'medianMonthlyExpenses'
  | 'effectiveLimit'
  | 'limitDiff'
  | 'net'
  | 'currentBalance';

export interface ColumnPreference {
  label: string;
  visible: boolean;
  color?: string;
}

export type ColumnPreferences = Record<ColumnKey, ColumnPreference>;

export const DEFAULT_COLUMN_PREFERENCES: ColumnPreferences = {
  income: { label: 'Income', visible: true, color: '#10b981' },
  totalExpenses: { label: 'Expenses', visible: true, color: '#ef4444' },
  medianDailyExpenses: { label: 'Median/Day', visible: true, color: '#8b5cf6' },
  medianMonthlyExpenses: { label: 'Median/Month', visible: false, color: '#a78bfa' },
  effectiveLimit: { label: 'Limit', visible: true, color: '#f59e0b' },
  limitDiff: { label: 'Limit Diff', visible: true },
  net: { label: 'Net', visible: true },
  currentBalance: { label: 'Balance', visible: true },
};

export const COLUMN_ORDER: ColumnKey[] = [
  'totalExpenses',
  'medianDailyExpenses',
  'medianMonthlyExpenses',
  'income',
  'effectiveLimit',
  'limitDiff',
  'net',
  'currentBalance',
];
