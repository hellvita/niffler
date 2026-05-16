import { test as base, request, type Page } from '@playwright/test';
import { format } from 'date-fns';

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL ?? 'http://localhost:5048';

export interface AuthFixture {
  page: Page;
  email: string;
  password: string;
}

export const test = base.extend<{ authenticated: AuthFixture }>({
  authenticated: async ({ page, context }, use) => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'testpassword123';
    const hostname = new URL(FRONTEND_URL).hostname;

    // Prefer the frontend proxy for registration so we don't need direct backend access
    const apiCtx = await request.newContext({ baseURL: FRONTEND_URL });
    const res = await apiCtx.post('/api/auth/register', {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok()) {
      // Fallback: try the backend directly (works when running from Windows)
      const fallbackRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!fallbackRes.ok) {
        throw new Error(`Registration failed: ${fallbackRes.status} ${await fallbackRes.text()}`);
      }
      const { token, expiresAt } = await fallbackRes.json() as { token: string; expiresAt: string };
      const expirySeconds = Math.floor(new Date(expiresAt).getTime() / 1000);
      await context.addCookies([
        { name: 'auth_token', value: token, domain: hostname, path: '/', httpOnly: true, secure: false, sameSite: 'Strict', expires: expirySeconds },
        { name: 'user_email', value: email, domain: hostname, path: '/', httpOnly: false, secure: false, sameSite: 'Strict', expires: expirySeconds },
      ]);
      await apiCtx.dispose();
      await use({ page, email, password });
      await page.request.delete('/api/proxy/users/me').catch(() => {});
      return;
    }

    // Extract auth_token from Set-Cookie header (frontend proxy sets httpOnly cookie)
    const setCookieHeaders = res.headersArray()
      .filter(h => h.name.toLowerCase() === 'set-cookie')
      .map(h => h.value);

    const tokenCookieRaw = setCookieHeaders.find(h => h.startsWith('auth_token='));
    if (!tokenCookieRaw) throw new Error('auth_token cookie not in response — did the register route handler fail?');

    const tokenValue = tokenCookieRaw.split(';')[0].replace('auth_token=', '');
    const expiresMatch = tokenCookieRaw.match(/[Ee]xpires=([^;]+)/);
    const expires = expiresMatch ? Math.floor(new Date(expiresMatch[1]).getTime() / 1000) : Math.floor(Date.now() / 1000) + 86400;
    const userEmailRaw = setCookieHeaders.find(h => h.startsWith('user_email='));
    const userEmailValue = userEmailRaw ? userEmailRaw.split(';')[0].replace('user_email=', '') : email;

    await context.addCookies([
      { name: 'auth_token', value: tokenValue, domain: hostname, path: '/', httpOnly: true, secure: false, sameSite: 'Strict', expires },
      { name: 'user_email', value: userEmailValue, domain: hostname, path: '/', httpOnly: false, secure: false, sameSite: 'Strict', expires },
    ]);

    await apiCtx.dispose();
    await use({ page, email, password });

    // Teardown: delete the test account and all its data
    await page.request.delete('/api/proxy/users/me').catch(() => {});
  },
});

export { expect } from '@playwright/test';

export function today() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function currentYearMonth() {
  return format(new Date(), 'yyyy-MM');
}
