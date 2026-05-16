import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiGet, apiMutate } from '@/lib/api/client';

function mockFetch(status: number, body?: unknown) {
  const bodyStr = body !== undefined ? JSON.stringify(body) : null;
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(bodyStr, { status })
  );
}

describe('apiGet', () => {
  afterEach(() => vi.restoreAllMocks());

  it('calls GET /api/proxy/<path> and returns parsed JSON', async () => {
    const spy = mockFetch(200, [{ id: 'c1' }]);
    const result = await apiGet<{ id: string }[]>('categories');
    expect(spy).toHaveBeenCalledWith('/api/proxy/categories');
    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('forwards query string as part of the path', async () => {
    const spy = mockFetch(200, []);
    await apiGet('categories?includeArchived=true');
    expect(spy).toHaveBeenCalledWith('/api/proxy/categories?includeArchived=true');
  });

  it('throws Error whose message is the HTTP status on non-2xx response', async () => {
    mockFetch(404);
    await expect(apiGet('missing')).rejects.toThrow('404');
  });

  it('attaches a status property to the thrown error', async () => {
    mockFetch(401);
    const err = await apiGet('anything').catch(e => e);
    expect(err.status).toBe(401);
  });

  it('throws on 500 server error', async () => {
    mockFetch(500);
    await expect(apiGet('summary/all-time')).rejects.toThrow('500');
  });
});

describe('apiMutate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs with JSON body and Content-Type header', async () => {
    const spy = mockFetch(201, { id: 'new', name: 'Groceries', isArchived: false });
    const result = await apiMutate<{ id: string }>('POST', 'categories', { name: 'Groceries' });
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/categories');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init.body).toBe(JSON.stringify({ name: 'Groceries' }));
    expect(result).toEqual({ id: 'new', name: 'Groceries', isArchived: false });
  });

  it('PUTs to the correct path', async () => {
    const spy = mockFetch(200, { id: '1', name: 'Renamed', isArchived: false });
    await apiMutate('PUT', 'categories/1', { name: 'Renamed' });
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/categories/1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Renamed' });
  });

  it('returns null on 204 No Content', async () => {
    mockFetch(204);
    const result = await apiMutate('POST', 'categories/1/archive');
    expect(result).toBeNull();
  });

  it('sends no body when the body argument is omitted', async () => {
    const spy = mockFetch(204);
    await apiMutate('POST', 'categories/1/archive');
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeUndefined();
  });

  it('DELETEs at the correct path', async () => {
    const spy = mockFetch(204);
    await apiMutate('DELETE', 'expenses/2026-05-14/cat-1');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/expenses/2026-05-14/cat-1');
    expect(init.method).toBe('DELETE');
  });

  it('throws Error with status code on non-2xx response', async () => {
    mockFetch(409);
    await expect(apiMutate('POST', 'categories', { name: 'Dup' })).rejects.toThrow('409');
  });

  it('attaches a status property to the thrown error', async () => {
    mockFetch(422);
    const err = await apiMutate('PUT', 'me/budget', { initialBudget: -1 }).catch(e => e);
    expect(err.status).toBe(422);
  });
});
