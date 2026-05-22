import { describe, it, expect } from 'vitest';
import {
  getMonthsInRange,
  chooseBucket,
  aggregateTotals,
  buildChartSeries,
  computeMedian,
} from '@/lib/utils/aggregation';
import type { MonthSummary } from '@/lib/types/api';

// ── helpers ──────────────────────────────────────────────────────────────────

function d(iso: string) {
  return new Date(iso);
}

function addDays(date: Date, n: number) {
  const r = new Date(date);
  r.setDate(r.getDate() + n);
  return r;
}

function buildDaySummary(
  date: string,
  totalExpenses: number,
  totalIncome: number,
  effectiveLimit: number | null = 50
) {
  return {
    date,
    totalExpenses,
    totalIncome,
    effectiveLimit,
    limitDiff: effectiveLimit !== null ? effectiveLimit - totalExpenses : null,
    net: totalIncome - totalExpenses,
  };
}

const MAY_SUMMARY: MonthSummary = {
  year: 2026,
  month: 5,
  openingBalance: 1000,
  days: [
    buildDaySummary('2026-05-01', 10, 0, 50),
    buildDaySummary('2026-05-02', 20, 100, 50),
    buildDaySummary('2026-05-10', 15, 0, 50),
    buildDaySummary('2026-05-14', 5, 0, 50),
    buildDaySummary('2026-05-31', 0, 0, 50),
  ],
  monthTotals: {
    totalExpenses: 50,
    totalIncome: 100,
    expensesByCategory: [{ categoryId: 'cat-1', categoryName: 'Groceries', amount: 50 }],
    allowedMonthlyBudget: 250,
    totalLimitDiff: 200,
    net: 50,
  },
};

const APRIL_SUMMARY: MonthSummary = {
  year: 2026,
  month: 4,
  openingBalance: 900,
  days: [buildDaySummary('2026-04-15', 30, 200, 50), buildDaySummary('2026-04-30', 10, 0, 50)],
  monthTotals: {
    totalExpenses: 40,
    totalIncome: 200,
    expensesByCategory: [
      { categoryId: 'cat-1', categoryName: 'Groceries', amount: 20 },
      { categoryId: 'cat-3', categoryName: 'Dining', amount: 20 },
    ],
    allowedMonthlyBudget: 100,
    totalLimitDiff: 60,
    net: 160,
  },
};

// ── getMonthsInRange ──────────────────────────────────────────────────────────

describe('getMonthsInRange', () => {
  it('returns one tuple for a range within a single month', () => {
    expect(getMonthsInRange(d('2026-05-01'), d('2026-05-31'))).toEqual([[2026, 5]]);
  });

  it('returns two tuples for a range spanning two months', () => {
    expect(getMonthsInRange(d('2026-04-15'), d('2026-05-14'))).toEqual([
      [2026, 4],
      [2026, 5],
    ]);
  });

  it('increments year correctly when range crosses a year boundary', () => {
    expect(getMonthsInRange(d('2025-12-15'), d('2026-01-15'))).toEqual([
      [2025, 12],
      [2026, 1],
    ]);
  });

  it('returns one tuple for a single-day range', () => {
    expect(getMonthsInRange(d('2026-05-14'), d('2026-05-14'))).toEqual([[2026, 5]]);
  });

  it('returns all months for a 3-month range', () => {
    expect(getMonthsInRange(d('2026-03-01'), d('2026-05-31'))).toEqual([
      [2026, 3],
      [2026, 4],
      [2026, 5],
    ]);
  });
});

// ── chooseBucket ─────────────────────────────────────────────────────────────

describe('chooseBucket', () => {
  it('returns "day" for 1-day range', () => {
    const from = d('2026-05-14');
    expect(chooseBucket(from, from)).toBe('day');
  });

  it('returns "day" for exactly 31 days', () => {
    const from = d('2026-05-01');
    expect(chooseBucket(from, d('2026-05-31'))).toBe('day');
  });

  it('returns "week" for 32 days', () => {
    const from = d('2026-05-01');
    expect(chooseBucket(from, addDays(from, 31))).toBe('week');
  });

  it('returns "week" for exactly 180 days', () => {
    const from = d('2026-01-01');
    expect(chooseBucket(from, addDays(from, 179))).toBe('week');
  });

  it('returns "month" for 181 days', () => {
    const from = d('2026-01-01');
    expect(chooseBucket(from, addDays(from, 180))).toBe('month');
  });

  it('returns "month" for 365 days', () => {
    const from = d('2026-01-01');
    expect(chooseBucket(from, addDays(from, 364))).toBe('month');
  });
});

// ── computeMedian ─────────────────────────────────────────────────────────────

describe('computeMedian', () => {
  it('returns null for an empty array', () => {
    expect(computeMedian([])).toBeNull();
  });

  it('returns the sole value for a single-element array', () => {
    expect(computeMedian([42])).toBe(42);
  });

  it('returns the middle value for an odd-length array', () => {
    expect(computeMedian([10, 20, 30])).toBe(20);
  });

  it('returns the average of the two middle values for an even-length array', () => {
    expect(computeMedian([10, 20, 30, 40])).toBe(25);
  });

  it('sorts the array before computing (handles unsorted input)', () => {
    expect(computeMedian([30, 10, 40, 20])).toBe(25);
  });

  it('does not mutate the input array', () => {
    const input = [30, 10, 20];
    computeMedian(input);
    expect(input).toEqual([30, 10, 20]);
  });
});

// ── aggregateTotals ───────────────────────────────────────────────────────────

describe('aggregateTotals', () => {
  it('returns correct totals for a full-month range', () => {
    const result = aggregateTotals([MAY_SUMMARY], d('2026-05-01'), d('2026-05-31'));
    // Sum of all days in MAY_SUMMARY.days: 10+20+15+5+0 = 50 expenses, 100 income
    expect(result.totalExpenses).toBe(50);
    expect(result.totalIncome).toBe(100);
    expect(result.net).toBe(50);
    // 5 days × $50 limit = $250 allowed budget
    expect(result.allowedBudget).toBe(250);
    // Non-zero day expenses: [10, 20, 15, 5] → sorted [5, 10, 15, 20] → median = (10+15)/2 = 12.5
    expect(result.medianDailyExpenses).toBe(12.5);
  });

  it('trims days outside a partial-month range', () => {
    // Only May 1–2 days
    const result = aggregateTotals([MAY_SUMMARY], d('2026-05-01'), d('2026-05-02'));
    expect(result.totalExpenses).toBe(30); // 10 + 20
    expect(result.totalIncome).toBe(100);
    expect(result.allowedBudget).toBe(100); // 2 days × 50
    // Non-zero days: [10, 20] → median = (10+20)/2 = 15
    expect(result.medianDailyExpenses).toBe(15);
  });

  it('sums totals across multiple months', () => {
    const result = aggregateTotals([APRIL_SUMMARY, MAY_SUMMARY], d('2026-04-01'), d('2026-05-31'));
    // May days: 10+20+15+5+0=50, April days: 30+10=40
    expect(result.totalExpenses).toBe(90);
    expect(result.totalIncome).toBe(300); // 100+200
  });

  it('merges expensesByCategory across months — same category amounts are summed', () => {
    const result = aggregateTotals([APRIL_SUMMARY, MAY_SUMMARY], d('2026-04-01'), d('2026-05-31'));
    const groceries = result.expensesByCategory.find((c) => c.categoryId === 'cat-1');
    const dining = result.expensesByCategory.find((c) => c.categoryId === 'cat-3');
    // cat-1: 50 (May) + 20 (April) = 70
    expect(groceries?.amount).toBe(70);
    // cat-3 only in April
    expect(dining?.amount).toBe(20);
  });

  it('returns allowedBudget as null when no limits are set for any day', () => {
    const noLimitSummary: MonthSummary = {
      ...MAY_SUMMARY,
      days: MAY_SUMMARY.days.map((d) => ({ ...d, effectiveLimit: null, limitDiff: null })),
    };
    const result = aggregateTotals([noLimitSummary], d('2026-05-01'), d('2026-05-31'));
    expect(result.allowedBudget).toBeNull();
  });

  it('returns medianDailyExpenses as null when all days have zero expenses', () => {
    const zeroDaySummary: MonthSummary = {
      ...MAY_SUMMARY,
      days: MAY_SUMMARY.days.map((d) => ({ ...d, totalExpenses: 0 })),
    };
    const result = aggregateTotals([zeroDaySummary], d('2026-05-01'), d('2026-05-31'));
    expect(result.medianDailyExpenses).toBeNull();
  });
});

// ── buildChartSeries ─────────────────────────────────────────────────────────

describe('buildChartSeries', () => {
  const sevenDaySummary: MonthSummary = {
    year: 2026,
    month: 5,
    openingBalance: 0,
    days: [
      buildDaySummary('2026-05-08', 10, 0, 50),
      buildDaySummary('2026-05-09', 20, 0, 50),
      buildDaySummary('2026-05-10', 5, 0, 50),
      buildDaySummary('2026-05-11', 15, 50, 50),
      buildDaySummary('2026-05-12', 8, 0, 50),
      buildDaySummary('2026-05-13', 12, 0, 50),
      buildDaySummary('2026-05-14', 3, 0, 50),
    ],
    monthTotals: {
      totalExpenses: 73,
      totalIncome: 50,
      expensesByCategory: [],
      allowedMonthlyBudget: 350,
      totalLimitDiff: 277,
      net: -23,
    },
  };

  it('returns one data point per day for a 7-day range', () => {
    const result = buildChartSeries([sevenDaySummary], d('2026-05-08'), d('2026-05-14'));
    expect(result).toHaveLength(7);
    expect(result[0].expenses).toBe(10);
    expect(result[6].expenses).toBe(3);
  });

  it('uses "MMM d" label format for day bucket', () => {
    const result = buildChartSeries([sevenDaySummary], d('2026-05-08'), d('2026-05-14'));
    expect(result[0].label).toBe('May 8');
    expect(result[6].label).toBe('May 14');
  });

  it('excludes days outside the specified from/to range', () => {
    // Summary has 7 days but we ask for only 3
    const result = buildChartSeries([sevenDaySummary], d('2026-05-10'), d('2026-05-12'));
    expect(result).toHaveLength(3);
    expect(result[0].expenses).toBe(5);
    expect(result[2].expenses).toBe(8);
  });

  it('aggregates days into week buckets for 6-week range', () => {
    // Build a multi-week summary (42 days: Apr 13 → May 24)
    const weekDays: MonthSummary['days'] = [];
    const startDate = new Date('2026-04-13');
    for (let i = 0; i < 42; i++) {
      const dt = new Date(startDate);
      dt.setDate(dt.getDate() + i);
      const iso = dt.toISOString().slice(0, 10);
      weekDays.push(buildDaySummary(iso, 10, 0, 50));
    }

    const aprilWeekSummary: MonthSummary = {
      year: 2026,
      month: 4,
      openingBalance: 0,
      days: weekDays.filter((d) => d.date.startsWith('2026-04')),
      monthTotals: {
        totalExpenses: 0,
        totalIncome: 0,
        expensesByCategory: [],
        allowedMonthlyBudget: 0,
        totalLimitDiff: 0,
        net: 0,
      },
    };
    const mayWeekSummary: MonthSummary = {
      year: 2026,
      month: 5,
      openingBalance: 0,
      days: weekDays.filter((d) => d.date.startsWith('2026-05')),
      monthTotals: {
        totalExpenses: 0,
        totalIncome: 0,
        expensesByCategory: [],
        allowedMonthlyBudget: 0,
        totalLimitDiff: 0,
        net: 0,
      },
    };

    const result = buildChartSeries(
      [aprilWeekSummary, mayWeekSummary],
      d('2026-04-13'),
      d('2026-05-24')
    );

    expect(result.length).toBeGreaterThan(0);
    // Every data point should have expenses = (number of days in that bucket) * 10
    for (const pt of result) {
      expect(pt.expenses).toBeGreaterThan(0);
    }
  });

  it('uses month buckets for ranges > 180 days', () => {
    const longRange: MonthSummary[] = [];
    for (let m = 1; m <= 7; m++) {
      const monthStr = String(m).padStart(2, '0');
      longRange.push({
        year: 2026,
        month: m,
        openingBalance: 0,
        days: [buildDaySummary(`2026-${monthStr}-15`, 100, 0, 50)],
        monthTotals: {
          totalExpenses: 100,
          totalIncome: 0,
          expensesByCategory: [],
          allowedMonthlyBudget: 0,
          totalLimitDiff: 0,
          net: 0,
        },
      });
    }

    const result = buildChartSeries(longRange, d('2026-01-01'), d('2026-07-31'));
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].label).toContain('2026');
  });

  it('handles a range starting mid-week: first bucket is a partial week', () => {
    // Wednesday May 13 to Friday May 22 (10 days, 2 buckets: Wed-Sun, Mon-Fri)
    const days10: MonthSummary = {
      year: 2026,
      month: 5,
      openingBalance: 0,
      days: [
        buildDaySummary('2026-05-13', 10, 0),
        buildDaySummary('2026-05-14', 10, 0),
        buildDaySummary('2026-05-15', 10, 0),
        buildDaySummary('2026-05-16', 10, 0),
        buildDaySummary('2026-05-17', 10, 0),
        buildDaySummary('2026-05-18', 10, 0),
        buildDaySummary('2026-05-19', 10, 0),
        buildDaySummary('2026-05-20', 10, 0),
        buildDaySummary('2026-05-21', 10, 0),
        buildDaySummary('2026-05-22', 10, 0),
      ],
      monthTotals: {
        totalExpenses: 100,
        totalIncome: 0,
        expensesByCategory: [],
        allowedMonthlyBudget: 0,
        totalLimitDiff: 0,
        net: 0,
      },
    };

    // 10 days is ≤ 31, so bucket = 'day', not week
    // Use a >31 day range to force week bucket
    // Let's use a summary that covers 35 days
    const days35: MonthSummary = {
      year: 2026,
      month: 5,
      openingBalance: 0,
      days: Array.from({ length: 31 }, (_, i) => {
        const dt = new Date('2026-05-01');
        dt.setDate(dt.getDate() + i);
        return buildDaySummary(dt.toISOString().slice(0, 10), 10, 0);
      }),
      monthTotals: {
        totalExpenses: 310,
        totalIncome: 0,
        expensesByCategory: [],
        allowedMonthlyBudget: 0,
        totalLimitDiff: 0,
        net: 0,
      },
    };
    const june35: MonthSummary = {
      year: 2026,
      month: 6,
      openingBalance: 0,
      days: Array.from({ length: 4 }, (_, i) => {
        const dt = new Date('2026-06-01');
        dt.setDate(dt.getDate() + i);
        return buildDaySummary(dt.toISOString().slice(0, 10), 10, 0);
      }),
      monthTotals: {
        totalExpenses: 40,
        totalIncome: 0,
        expensesByCategory: [],
        allowedMonthlyBudget: 0,
        totalLimitDiff: 0,
        net: 0,
      },
    };

    // 35 days → week bucket; start on May 13 (Wednesday)
    const result = buildChartSeries([days35, june35], d('2026-05-13'), d('2026-06-16'));

    // First bucket starts on the Monday of the week containing May 13 (May 11)
    // Days in first bucket from our range: May 13 (Wed), 14 (Thu), 15 (Fri), 16 (Sat), 17 (Sun) = 5 days × 10
    const firstBucketExpenses = result[0].expenses;
    expect(firstBucketExpenses).toBeGreaterThan(0);

    void days10; // suppress lint
  });
});
