import { describe, it, expect, vi, afterEach } from 'vitest';
import { upsertExpense, deleteExpense } from '@/lib/api/expenses';

function mockFetch(status: number) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status }));
}

describe('upsertExpense', () => {
  afterEach(() => vi.restoreAllMocks());

  it('PUTs to /api/proxy/expenses/{date}/{categoryId} with amount', async () => {
    const spy = mockFetch(204);
    await upsertExpense('2026-05-14', 'cat-1', 42.5);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/expenses/2026-05-14/cat-1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ amount: 42.5 });
  });

  it('returns null on success (204)', async () => {
    mockFetch(204);
    const result = await upsertExpense('2026-05-14', 'cat-1', 10);
    expect(result).toBeNull();
  });

  it('throws on non-ok response', async () => {
    mockFetch(404);
    await expect(upsertExpense('2026-05-14', 'missing', 10)).rejects.toThrow('404');
  });
});

describe('deleteExpense', () => {
  afterEach(() => vi.restoreAllMocks());

  it('DELETEs /api/proxy/expenses/{date}/{categoryId}', async () => {
    const spy = mockFetch(204);
    await deleteExpense('2026-05-14', 'cat-1');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/expenses/2026-05-14/cat-1');
    expect(init.method).toBe('DELETE');
  });

  it('returns null on success (204)', async () => {
    mockFetch(204);
    const result = await deleteExpense('2026-05-14', 'cat-1');
    expect(result).toBeNull();
  });
});
