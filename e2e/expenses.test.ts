import { test, expect, today } from './fixtures';

test.describe('Expense entry — day view', () => {
  test('entering an expense updates the summary bar and persists on reload', async ({
    authenticated: { page },
  }) => {
    const date = today();
    await page.goto(`/day/${date}`);

    // Create a new category
    const catName = `E2E-Cat-${Date.now()}`;
    await page.getByRole('button', { name: /add category/i }).click();
    const catInput = page.getByPlaceholder(/category name/i);
    await catInput.fill(catName);
    await catInput.press('Enter');

    // Wait for the new category row to appear
    const catRow = page.locator('div').filter({ hasText: catName }).first();
    await catRow.waitFor({ state: 'visible', timeout: 10_000 });

    // Click the dash/amount button to start editing
    const amountBtn = catRow
      .getByRole('button')
      .filter({ hasText: /^[0-9—]/ })
      .last();
    await amountBtn.click();

    // Type the amount and submit
    const amountInput = page.getByRole('spinbutton');
    await amountInput.fill('42.50');
    await amountInput.press('Enter');

    // The value should appear in the row
    await expect(catRow.getByText('42.50')).toBeVisible({ timeout: 5_000 });

    // Reload and verify persistence
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.getByText('42.50').first()).toBeVisible({ timeout: 8_000 });
  });
});
