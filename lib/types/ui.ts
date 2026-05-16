export type ColumnKey =
  | 'income'
  | 'totalExpenses'
  | 'effectiveLimit'
  | 'limitDiff'
  | 'net'
  | 'currentBalance';

export interface ColumnPreference {
  label: string;
  visible: boolean;
}

export type ColumnPreferences = Record<ColumnKey, ColumnPreference>;

export const DEFAULT_COLUMN_PREFERENCES: ColumnPreferences = {
  income:         { label: 'Income',     visible: true },
  totalExpenses:  { label: 'Expenses',   visible: true },
  effectiveLimit: { label: 'Limit',      visible: true },
  limitDiff:      { label: 'Limit Diff', visible: true },
  net:            { label: 'Net',        visible: true },
  currentBalance: { label: 'Balance',    visible: true },
};

export const COLUMN_ORDER: ColumnKey[] = [
  'totalExpenses',
  'income',
  'effectiveLimit',
  'limitDiff',
  'net',
  'currentBalance',
];
