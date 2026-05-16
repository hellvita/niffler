// Auth
export interface AuthResponse {
  token: string;
  expiresAt: string; // ISO 8601
}

// Budget
export interface BudgetResponse {
  initialBudget: number;
}

// Categories
export interface Category {
  id: string;
  name: string;
  isArchived: boolean;
}

// Expenses
export interface ExpenseByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
}

// Limits
export interface LimitEntry {
  effectiveFromDate: string; // yyyy-MM-dd
  amount: number;
}

// Summary — day
export interface DaySummary {
  date: string;
  income: number;
  expensesByCategory: ExpenseByCategory[];
  totalExpenses: number;
  effectiveLimit: number | null;
  limitDiff: number | null;
  net: number;
}

// Summary — month
export interface MonthSummaryDay {
  date: string;
  totalExpenses: number;
  totalIncome: number;
  effectiveLimit: number | null;
  limitDiff: number | null;
  net: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  openingBalance: number;
  days: MonthSummaryDay[];
  monthTotals: {
    totalExpenses: number;
    totalIncome: number;
    expensesByCategory: ExpenseByCategory[];
    allowedMonthlyBudget: number;
    totalLimitDiff: number;
    net: number;
  };
}

// Summary — all-time
export interface AllTimeSummary {
  initialBudget: number;
  totalIncome: number;
  totalExpenses: number;
  totalLimitDiff: number;
  currentBalance: number;
  net: number;
}

// Import — parse response
export interface ParsedColumn {
  index: number;
  letter: string;
  header: string;
  samples: string[];
}

export interface ParseResult {
  fileId: string;
  columns: ParsedColumn[];
}

// Import — mapping payload (sent to /preview and /execute)
export interface ColumnMapping {
  fileId: string;
  dateColumnIndex: number;
  categoryColumnIndexes: number[];
  incomeColumnIndex: number;
  scaleFactor: number;
  invertSign: boolean;
}

// Import — preview response
export interface PreviewExpense {
  categoryName: string;
  amount: number;
}

export interface PreviewRow {
  date: string; // yyyy-MM-dd
  expenses: PreviewExpense[];
  income: number;
}

export interface PreviewResult {
  totalDataRows: number;
  skippedRows: number;
  preview: PreviewRow[];
}

// Import — execute response
export interface ImportResult {
  daysImported: number;
  rowsSkipped: number;
  categoriesCreated: string[];
  expensesUpserted: number;
  incomesUpserted: number;
}
