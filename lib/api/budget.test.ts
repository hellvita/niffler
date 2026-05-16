import { describe, it, expect, vi, afterEach } from 'vitest';
import { getInitialBudget, setInitialBudget } from './budget';

function mockFetch(status: number, body?: unknown) {
  const bodyStr = body !== undefined ? JSON.stringify(body) : null;
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(bodyStr, { status })
  );
}

describe('getInitialBudget', () => {
  afterEach(() => vi.restoreAllMocks());

  it('GETs /api/proxy/me/budget and returns BudgetResponse', async () => {
    const spy = mockFetch(200, { initialBudget: 1000 });
    const result = await getInitialBudget();
    expect(spy).toHaveBeenCalledWith('/api/proxy/me/budget');
    expect(result).toEqual({ initialBudget: 1000 });
  });

  it('throws on non-ok response', async () => {
    mockFetch(401);
    await expect(getInitialBudget()).rejects.toThrow('401');
  });
});

describe('setInitialBudget', () => {
  afterEach(() => vi.restoreAllMocks());

  it('PUTs to /api/proxy/me/budget with the new amount', async () => {
    const spy = mockFetch(200, { initialBudget: 2000 });
    const result = await setInitialBudget(2000);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/me/budget');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ initialBudget: 2000 });
    expect(result).toEqual({ initialBudget: 2000 });
  });
});
