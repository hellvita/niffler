import { describe, it, expect, vi, afterEach } from 'vitest';
import { login, register, logout } from './auth';

function mockFetch(status: number, body?: unknown) {
  const bodyStr = body !== undefined ? JSON.stringify(body) : null;
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(bodyStr, { status })
  );
}

describe('login', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/auth/login with email and password', async () => {
    const spy = mockFetch(200, { expiresAt: '2026-06-01T00:00:00Z' });
    await login('a@b.com', 'password1');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'a@b.com', password: 'password1' });
  });

  it('returns expiresAt on success', async () => {
    mockFetch(200, { expiresAt: '2026-06-01T00:00:00Z' });
    const result = await login('a@b.com', 'password1');
    expect(result.expiresAt).toBe('2026-06-01T00:00:00Z');
  });

  it('throws on 401 invalid credentials', async () => {
    mockFetch(401, { message: 'Invalid credentials' });
    await expect(login('a@b.com', 'wrong')).rejects.toThrow('401');
  });
});

describe('register', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/auth/register with email and password', async () => {
    const spy = mockFetch(200, { expiresAt: '2026-06-01T00:00:00Z' });
    await register('new@b.com', 'password1');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/auth/register');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'new@b.com', password: 'password1' });
  });

  it('returns expiresAt on success', async () => {
    mockFetch(200, { expiresAt: '2026-07-01T00:00:00Z' });
    const result = await register('new@b.com', 'password1');
    expect(result.expiresAt).toBe('2026-07-01T00:00:00Z');
  });

  it('throws on 409 when email is already taken', async () => {
    mockFetch(409, { message: 'Email already exists' });
    await expect(register('taken@b.com', 'password1')).rejects.toThrow('409');
  });
});

describe('logout', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/auth/logout', async () => {
    const spy = mockFetch(200);
    await logout();
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/auth/logout');
    expect(init.method).toBe('POST');
  });
});
