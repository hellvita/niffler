import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

test.describe('Register and login UI', () => {
  test('registers a new user and lands on the day view', async ({ page }) => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'testpassword123';

    await page.goto('/register');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByLabel(/confirm password/i).fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    const today = format(new Date(), 'yyyy-MM-dd');
    await page.waitForURL(`**/day/${today}`, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();

    await page.request.delete('/api/proxy/users/me').catch(() => {});
  });

  test('redirects to the app when already logged in and visiting /login', async ({
    page,
    context,
  }) => {
    // Register to get a token
    const email = `test+${Date.now()}@example.com`;
    const password = 'testpassword123';
    const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL ?? 'http://localhost:5048';
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const { token, expiresAt } = (await res.json()) as { token: string; expiresAt: string };
    await context.addCookies([
      {
        name: 'auth_token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        expires: Math.floor(new Date(expiresAt).getTime() / 1000),
      },
    ]);

    await page.goto('/login');
    const today = format(new Date(), 'yyyy-MM-dd');
    await page.waitForURL(`**/day/${today}`, { timeout: 10_000 });

    await page.request.delete('/api/proxy/users/me').catch(() => {});
  });
});
