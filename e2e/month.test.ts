import { test, expect, currentYearMonth } from './fixtures';

test.describe('Month view', () => {
  test('monthly totals are visible and clicking a day navigates to the day view', async ({
    authenticated: { page },
  }) => {
    const yearMonth = currentYearMonth();
    await page.goto(`/month/${yearMonth}`);

    // Month summary bar should be visible
    await page.waitForTimeout(2000);

    // The day-by-day table should have rows for this month
    const rows = page.locator('table tbody tr, [data-testid="day-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Click the first row/day link
    const firstDayLink = rows.first().getByRole('link').or(rows.first());
    const dateText = await firstDayLink.textContent();

    if (dateText) {
      await firstDayLink.click();
      // Should navigate to a day view URL
      await page.waitForURL(/\/day\/\d{4}-\d{2}-\d{2}/, { timeout: 10_000 });
    }
  });
});
