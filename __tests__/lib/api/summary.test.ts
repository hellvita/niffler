import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDaySummary, getMonthSummary, getAllTimeSummary } from '@/lib/api/summary';

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status })
  );
}

const daySummary = {
  date: '2026-05-14', income: 100,
  expensesByCategory: [{ categoryId: 'c1', categoryName: 'Groceries', amount: 42.5 }],
  totalExpenses: 42.5, effectiveLimit: 50, limitDiff: 7.5, net: 57.5,
};

const monthSummary = {
  year: 2026, month: 5, openingBalance: 1000,
  days: [{ date: '2026-05-14', totalExpenses: 42.5, totalIncome: 100, effectiveLimit: 50, limitDiff: 7.5, net: 57.5 }],
  monthTotals: { totalExpenses: 42.5, totalIncome: 100, expensesByCategory: [], allowedMonthlyBudget: 1550, totalLimitDiff: 7.5, net: 57.5 },
};

const allTimeSummary = {
  initialBudget: 5000, totalIncome: 3000, totalExpenses: 2000,
  totalLimitDiff: 0, currentBalance: 6000, net: 1000,
};

describe('getDaySummary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('GETs /api/proxy/summary/day/{date} and returns DaySummary', async () => {
    const spy = mockFetch(200, daySummary);
    const result = await getDaySummary('2026-05-14');
    expect(spy).toHaveBeenCalledWith('/api/proxy/summary/day/2026-05-14');
    expect(result).toEqual(daySummary);
  });

  it('throws on non-ok response', async () => {
    mockFetch(401, { message: 'Unauthorized' });
    await expect(getDaySummary('2026-05-14')).rejects.toThrow('401');
  });
});

describe('getMonthSummary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('GETs /api/proxy/summary/month/{yearMonth} and returns MonthSummary', async () => {
    const spy = mockFetch(200, monthSummary);
    const result = await getMonthSummary('2026-05');
    expect(spy).toHaveBeenCalledWith('/api/proxy/summary/month/2026-05');
    expect(result).toEqual(monthSummary);
  });

  it('throws on non-ok response', async () => {
    mockFetch(401, { message: 'Unauthorized' });
    await expect(getMonthSummary('2026-05')).rejects.toThrow('401');
  });
});

describe('getAllTimeSummary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('GETs /api/proxy/summary/all-time and returns AllTimeSummary', async () => {
    const spy = mockFetch(200, allTimeSummary);
    const result = await getAllTimeSummary();
    expect(spy).toHaveBeenCalledWith('/api/proxy/summary/all-time');
    expect(result).toEqual(allTimeSummary);
  });

  it('throws on non-ok response', async () => {
    mockFetch(401, { message: 'Unauthorized' });
    await expect(getAllTimeSummary()).rejects.toThrow('401');
  });
});
