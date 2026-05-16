import { describe, it, expect, vi, afterEach } from 'vitest';
import { getLimits, setLimit, deleteLimit } from './limits';

function mockFetch(status: number, body?: unknown) {
  const bodyStr = body !== undefined ? JSON.stringify(body) : null;
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(bodyStr, { status })
  );
}

const entry = (overrides = {}) => ({
  effectiveFromDate: '2026-05-01', amount: 50, ...overrides,
});

describe('getLimits', () => {
  afterEach(() => vi.restoreAllMocks());

  it('GETs /api/proxy/limits and returns all limit entries', async () => {
    const spy = mockFetch(200, [entry()]);
    const result = await getLimits();
    expect(spy).toHaveBeenCalledWith('/api/proxy/limits');
    expect(result).toEqual([entry()]);
  });

  it('returns an empty array when no limits are set', async () => {
    mockFetch(200, []);
    const result = await getLimits();
    expect(result).toEqual([]);
  });

  it('throws on non-ok response', async () => {
    mockFetch(401);
    await expect(getLimits()).rejects.toThrow('401');
  });
});

describe('setLimit', () => {
  afterEach(() => vi.restoreAllMocks());

  it('PUTs to /api/proxy/limits/{date} with amount', async () => {
    const spy = mockFetch(200, entry());
    await setLimit('2026-05-01', 50);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/limits/2026-05-01');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ amount: 50 });
  });

  it('returns the upserted limit entry', async () => {
    mockFetch(200, entry({ amount: 75 }));
    const result = await setLimit('2026-05-01', 75);
    expect(result?.amount).toBe(75);
  });
});

describe('deleteLimit', () => {
  afterEach(() => vi.restoreAllMocks());

  it('DELETEs /api/proxy/limits/{date}', async () => {
    const spy = mockFetch(204);
    await deleteLimit('2026-05-01');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/limits/2026-05-01');
    expect(init.method).toBe('DELETE');
  });

  it('returns null on success (204)', async () => {
    mockFetch(204);
    const result = await deleteLimit('2026-05-01');
    expect(result).toBeNull();
  });
});
