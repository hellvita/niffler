import {
  differenceInDays,
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import type { MonthSummary } from '@/lib/types/api';
import { ANALYTICS_DAY_BUCKET_MAX_DAYS, ANALYTICS_WEEK_BUCKET_MAX_DAYS } from '@/lib/constants';

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
  /** Median of per-day expense totals, counting only days with expenses > 0
   *  ("typical spend on days you spent something" — see AboutModal.tsx Metrics Reference).
   *  Null when no day in range had any expense. */
  medianDailyExpenses: number | null;
  /** Median of per-month expense totals, counting only complete calendar months in range
   *  with expenses > 0 (partial months at the edges of the range are excluded — see
   *  AboutModal.tsx Metrics Reference). Null when the range has no complete month or none
   *  had expenses. */
  medianMonthlyExpenses: number | null;
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
  if (days <= ANALYTICS_DAY_BUCKET_MAX_DAYS) return 'day';
  if (days <= ANALYTICS_WEEK_BUCKET_MAX_DAYS) return 'week';
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
    // Day-level: filter by exact date range for accurate expense/income/limit/category totals
    for (const day of summary.days) {
      if (day.date < fromStr || day.date > toStr) continue;
      totalExpenses += day.totalExpenses;
      totalIncome += day.totalIncome;
      if (day.effectiveLimit !== null) {
        hasAnyLimit = true;
        allowedBudget += day.effectiveLimit;
      }
      // Intentionally excludes zero-expense days — "median" here means typical spend on days
      // you actually spent something, matching the Metrics Reference in components/nav/AboutModal.tsx.
      // Do not "fix" this without updating that copy too.
      if (day.totalExpenses > 0) dailyExpenses.push(day.totalExpenses);
      const monthKey = day.date.slice(0, 7);
      monthlyExpenses.set(monthKey, (monthlyExpenses.get(monthKey) ?? 0) + day.totalExpenses);

      for (const cat of day.expensesByCategory) {
        const prev = catMap.get(cat.categoryId);
        if (prev) {
          prev.amount += cat.amount;
        } else {
          catMap.set(cat.categoryId, { categoryName: cat.categoryName, amount: cat.amount });
        }
      }
    }
  }

  // Only count calendar months fully contained in [from, to] — a range like Jan 15–Mar 15
  // would otherwise mix partial Jan/Mar totals with a full Feb total in the same median.
  // Compared as yyyy-MM-dd strings (not Date objects) because parseISO() gives midnight while
  // endOfMonth() gives 23:59:59.999 — a Date comparison would wrongly reject an exact
  // full-month range due to that time-of-day mismatch.
  //
  // Intentionally excludes zero-expense months (same rationale as medianDailyExpenses above —
  // see the Metrics Reference in components/nav/AboutModal.tsx). Do not "fix" this without
  // updating that copy too.
  const completeMonthTotals = Array.from(monthlyExpenses.entries())
    .filter(([monthKey]) => {
      const monthDate = parseISO(`${monthKey}-01`);
      const monthStartStr = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      const monthEndStr = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      return fromStr <= monthStartStr && toStr >= monthEndStr;
    })
    .map(([, total]) => total)
    .filter((v) => v > 0);

  return {
    totalExpenses,
    totalIncome,
    allowedBudget: hasAnyLimit ? allowedBudget : null,
    net: totalIncome - totalExpenses,
    medianDailyExpenses: computeMedian(dailyExpenses),
    medianMonthlyExpenses: computeMedian(completeMonthTotals),
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
    const buckets = new Map<string, DaySlice[]>();
    for (const day of days) {
      const key = format(startOfWeek(parseISO(day.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(day);
    }

    return Array.from(buckets.values()).map((bd) => {
      const rangeStart = parseISO(bd[0].date);
      const rangeEnd = parseISO(bd[bd.length - 1].date);
      const crossesMonth = format(rangeStart, 'MMM') !== format(rangeEnd, 'MMM');
      const label =
        bd.length === 1
          ? format(rangeStart, 'MMM d')
          : `${format(rangeStart, 'MMM d')}–${crossesMonth ? format(rangeEnd, 'MMM d') : format(rangeEnd, 'd')}`;
      return {
        label,
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
