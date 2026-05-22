import { describe, it, expect, vi, afterEach } from 'vitest';
import { upsertIncome, deleteIncome } from '@/lib/api/incomes';

function mockFetch(status: number) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status }));
}

describe('upsertIncome', () => {
  afterEach(() => vi.restoreAllMocks());

  it('PUTs to /api/proxy/incomes/{date} with amount', async () => {
    const spy = mockFetch(204);
    await upsertIncome('2026-05-14', 500);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/incomes/2026-05-14');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ amount: 500 });
  });

  it('returns null on success (204)', async () => {
    mockFetch(204);
    const result = await upsertIncome('2026-05-14', 500);
    expect(result).toBeNull();
  });

  it('throws on non-ok response', async () => {
    mockFetch(400);
    await expect(upsertIncome('bad-date', 500)).rejects.toThrow('400');
  });
});

describe('deleteIncome', () => {
  afterEach(() => vi.restoreAllMocks());

  it('DELETEs /api/proxy/incomes/{date}', async () => {
    const spy = mockFetch(204);
    await deleteIncome('2026-05-14');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/incomes/2026-05-14');
    expect(init.method).toBe('DELETE');
  });

  it('returns null on success (204)', async () => {
    mockFetch(204);
    const result = await deleteIncome('2026-05-14');
    expect(result).toBeNull();
  });
});
