import { differenceInDays, format, parseISO, startOfWeek, addDays, startOfMonth } from 'date-fns';
import type { MonthSummary } from '@/lib/types/api';

export interface ChartDataPoint {
  label: string;
  expenses: number;
  income: number;
  limit: number | null;
}

export interface AggregatedTotals {
  totalExpenses: number;
  totalIncome: number;
  allowedBudget: number | null; // null when no limits set for the range
  net: number;
  medianDailyExpenses: number | null; // null when no days had expenses
  medianMonthlyExpenses: number | null; // null when no months had expenses
  expensesByCategory: { categoryId: string; categoryName: string; amount: number }[];
}

export function computeMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Returns [year, month] tuples for every calendar month overlapping the range.
export function getMonthsInRange(from: Date, to: Date): [number, number][] {
  const months: [number, number][] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cur <= end) {
    months.push([cur.getFullYear(), cur.getMonth() + 1]);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

// ≤ 31 days → day  |  ≤ 180 days → week  |  > 180 days → month
export function chooseBucket(from: Date, to: Date): 'day' | 'week' | 'month' {
  const days = differenceInDays(to, from) + 1;
  if (days <= 31) return 'day';
  if (days <= 180) return 'week';
  return 'month';
}

export function aggregateTotals(summaries: MonthSummary[], from: Date, to: Date): AggregatedTotals {
  const fromStr = format(from, 'yyyy-MM-dd');
  const toStr = format(to, 'yyyy-MM-dd');

  let totalExpenses = 0;
  let totalIncome = 0;
  let allowedBudget = 0;
  let hasAnyLimit = false;
  const dailyExpenses: number[] = [];
  const monthlyExpenses = new Map<string, number>();
  const catMap = new Map<string, { categoryName: string; amount: number }>();

  for (const summary of summaries) {
    // Day-level: filter by exact date range for accurate expense/income/limit totals
    for (const day of summary.days) {
      if (day.date < fromStr || day.date > toStr) continue;
      totalExpenses += day.totalExpenses;
      totalIncome += day.totalIncome;
      if (day.effectiveLimit !== null) {
        hasAnyLimit = true;
        allowedBudget += day.effectiveLimit;
      }
      if (day.totalExpenses > 0) dailyExpenses.push(day.totalExpenses);
      const monthKey = day.date.slice(0, 7);
      monthlyExpenses.set(monthKey, (monthlyExpenses.get(monthKey) ?? 0) + day.totalExpenses);
    }

    // Category-level: monthTotals is whole-month only; used as-is (may include days outside
    // the range for partial months, but per-category day data isn't available from the API).
    for (const cat of summary.monthTotals.expensesByCategory) {
      const prev = catMap.get(cat.categoryId);
      if (prev) {
        prev.amount += cat.amount;
      } else {
        catMap.set(cat.categoryId, { categoryName: cat.categoryName, amount: cat.amount });
      }
    }
  }

  return {
    totalExpenses,
    totalIncome,
    allowedBudget: hasAnyLimit ? allowedBudget : null,
    net: totalIncome - totalExpenses,
    medianDailyExpenses: computeMedian(dailyExpenses),
    medianMonthlyExpenses: computeMedian(Array.from(monthlyExpenses.values()).filter((v) => v > 0)),
    expensesByCategory: Array.from(catMap.entries())
      .map(([categoryId, { categoryName, amount }]) => ({ categoryId, categoryName, amount }))
      .filter((c) => c.amount > 0),
  };
}

export function buildChartSeries(
  summaries: MonthSummary[],
  from: Date,
  to: Date
): ChartDataPoint[] {
  const bucket = chooseBucket(from, to);
  const fromStr = format(from, 'yyyy-MM-dd');
  const toStr = format(to, 'yyyy-MM-dd');

  type DaySlice = {
    date: string;
    totalExpenses: number;
    totalIncome: number;
    effectiveLimit: number | null;
  };

  const days: DaySlice[] = summaries
    .flatMap((s) => s.days)
    .filter((d) => d.date >= fromStr && d.date <= toStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (bucket === 'day') {
    return days.map((d) => ({
      label: format(parseISO(d.date), 'MMM d'),
      expenses: d.totalExpenses,
      income: d.totalIncome,
      limit: d.effectiveLimit,
    }));
  }

  function sumLimit(slice: DaySlice[]): number | null {
    const limited = slice.filter((d) => d.effectiveLimit !== null);
    if (limited.length === 0) return null;
    return limited.reduce((s, d) => s + (d.effectiveLimit ?? 0), 0);
  }

  if (bucket === 'week') {
    const buckets = new Map<string, { days: DaySlice[]; start: Date }>();
    for (const day of days) {
      const d = parseISO(day.date);
      const ws = startOfWeek(d, { weekStartsOn: 1 });
      const key = format(ws, 'yyyy-MM-dd');
      if (!buckets.has(key)) buckets.set(key, { days: [], start: ws });
      buckets.get(key)!.days.push(day);
    }

    return Array.from(buckets.values()).map(({ days: bd, start }) => {
      const end = addDays(start, 6);
      const crossesMonth = format(start, 'MMM') !== format(end, 'MMM');
      return {
        label: `${format(start, 'MMM d')}–${crossesMonth ? format(end, 'MMM d') : format(end, 'd')}`,
        expenses: bd.reduce((s, d) => s + d.totalExpenses, 0),
        income: bd.reduce((s, d) => s + d.totalIncome, 0),
        limit: sumLimit(bd),
      };
    });
  }

  // month bucket
  const mbuckets = new Map<string, { days: DaySlice[]; start: Date }>();
  for (const day of days) {
    const d = parseISO(day.date);
    const ms = startOfMonth(d);
    const key = format(ms, 'yyyy-MM');
    if (!mbuckets.has(key)) mbuckets.set(key, { days: [], start: ms });
    mbuckets.get(key)!.days.push(day);
  }

  return Array.from(mbuckets.values()).map(({ days: bd, start }) => ({
    label: format(start, 'MMM yyyy'),
    expenses: bd.reduce((s, d) => s + d.totalExpenses, 0),
    income: bd.reduce((s, d) => s + d.totalIncome, 0),
    limit: sumLimit(bd),
  }));
}
