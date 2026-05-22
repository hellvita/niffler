import { http, HttpResponse } from 'msw';

const BASE = '/api/proxy';

const mockCategories = [
  { id: 'cat-1', name: 'Groceries', isArchived: false },
  { id: 'cat-2', name: 'Transport', isArchived: false },
];

const mockDaySummary = (date: string) => ({
  date,
  income: 0,
  expensesByCategory: [
    { categoryId: 'cat-1', categoryName: 'Groceries', amount: 0 },
    { categoryId: 'cat-2', categoryName: 'Transport', amount: 0 },
  ],
  totalExpenses: 0,
  effectiveLimit: 50,
  limitDiff: 50,
  net: 0,
});

const mockMonthSummary = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  return {
    year,
    month,
    openingBalance: 0,
    days: [],
    monthTotals: {
      totalExpenses: 0,
      totalIncome: 0,
      expensesByCategory: [],
      allowedMonthlyBudget: 0,
      totalLimitDiff: 0,
      net: 0,
    },
  };
};

export const handlers = [
  // Categories
  http.get(`${BASE}/categories`, () => HttpResponse.json(mockCategories)),
  http.post(`${BASE}/categories`, async ({ request }) => {
    const { name } = (await request.json()) as { name: string };
    return HttpResponse.json({ id: 'cat-new', name, isArchived: false }, { status: 201 });
  }),
  http.put(`${BASE}/categories/:id`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({ id: 'cat-1', name: body.name, isArchived: false });
  }),
  http.post(`${BASE}/categories/:id/archive`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${BASE}/categories/:id/unarchive`, () => new HttpResponse(null, { status: 204 })),
  http.post(
    `${BASE}/categories/:id/merge-into/:targetId`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // Expenses
  http.put(`${BASE}/expenses/:date/:categoryId`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE}/expenses/:date/:categoryId`, () => new HttpResponse(null, { status: 204 })),

  // Incomes
  http.put(`${BASE}/incomes/:date`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE}/incomes/:date`, () => new HttpResponse(null, { status: 204 })),

  // Limits
  http.get(`${BASE}/limits`, () => HttpResponse.json([])),
  http.put(`${BASE}/limits/:date`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE}/limits/:date`, () => new HttpResponse(null, { status: 204 })),

  // Summary
  http.get(`${BASE}/summary/day/:date`, ({ params }) =>
    HttpResponse.json(mockDaySummary(params.date as string))
  ),
  http.get(`${BASE}/summary/month/:yearMonth`, ({ params }) =>
    HttpResponse.json(mockMonthSummary(params.yearMonth as string))
  ),
  http.get(`${BASE}/summary/all-time`, () =>
    HttpResponse.json({
      initialBudget: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalLimitDiff: 0,
      currentBalance: 0,
      net: 0,
    })
  ),

  // Budget
  http.get(`${BASE}/me/budget`, () => HttpResponse.json({ initialBudget: 0 })),
  http.put(`${BASE}/me/budget`, () => new HttpResponse(null, { status: 204 })),

  // Import
  http.post(`${BASE}/import/parse`, () =>
    HttpResponse.json({
      fileId: 'file-1',
      columns: [
        { index: 0, letter: 'A', header: 'Date', samples: ['2026-05-01'] },
        { index: 1, letter: 'B', header: 'Groceries', samples: ['42.50'] },
        { index: 2, letter: 'C', header: 'Transport', samples: ['15.00'] },
        { index: 3, letter: 'D', header: 'Income', samples: ['100.00'] },
      ],
    })
  ),
  http.post(`${BASE}/import/preview`, () =>
    HttpResponse.json({
      totalDataRows: 10,
      skippedRows: 0,
      preview: [
        {
          date: '2026-05-01',
          expenses: [{ categoryName: 'Groceries', amount: 42.5 }],
          income: 100,
        },
      ],
    })
  ),
  http.post(`${BASE}/import/execute`, () =>
    HttpResponse.json({
      daysImported: 10,
      rowsSkipped: 0,
      categoriesCreated: [],
      expensesUpserted: 10,
      incomesUpserted: 10,
    })
  ),

  // Export
  http.get(
    `${BASE}/export/month/:yearMonth`,
    () =>
      new HttpResponse(new ArrayBuffer(0), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="budget.xlsx"',
        },
      })
  ),
  http.get(
    `${BASE}/export/zip`,
    () =>
      new HttpResponse(new ArrayBuffer(0), {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="budget-all.zip"',
        },
      })
  ),
  http.get(
    `${BASE}/export/combined`,
    () =>
      new HttpResponse(new ArrayBuffer(0), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="budget-all-time.xlsx"',
        },
      })
  ),
];
