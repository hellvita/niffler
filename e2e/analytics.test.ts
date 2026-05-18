import { test, expect, today } from './fixtures';
import { format, subDays } from 'date-fns';

test.describe('Analytics view', () => {
  test('switching chart type does not trigger new network requests', async ({
    authenticated: { page },
  }) => {
    const toDate = today();
    const fromDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

    const networkRequests: string[] = [];
    // Track requests AFTER initial page load
    let trackingEnabled = false;

    page.on('request', req => {
      if (trackingEnabled && req.url().includes('/api/proxy/summary')) {
        networkRequests.push(req.url());
      }
    });

    await page.goto(`/analytics?from=${fromDate}&to=${toDate}&chart=pie`);
    await page.waitForTimeout(3000); // let initial fetches complete

    // Enable tracking only after initial load
    trackingEnabled = true;
    networkRequests.length = 0;

    // Find and click "Bar" chart type selector
    const barButton = page.getByRole('button', { name: /bar/i }).or(
      page.getByText('Bar').first()
    );
    await barButton.click();

    await page.waitForTimeout(500);

    // No new summary API calls should have been made
    expect(networkRequests).toHaveLength(0);
  });
});
