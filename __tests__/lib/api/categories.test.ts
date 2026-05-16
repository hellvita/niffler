import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getCategories, createCategory, renameCategory,
  mergeCategory, archiveCategory, unarchiveCategory,
} from '@/lib/api/categories';

function mockFetch(status: number, body?: unknown) {
  const bodyStr = body !== undefined ? JSON.stringify(body) : null;
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(bodyStr, { status })
  );
}

const cat = (overrides = {}) => ({ id: 'c1', name: 'Groceries', isArchived: false, ...overrides });

describe('getCategories', () => {
  afterEach(() => vi.restoreAllMocks());

  it('GETs active categories by default (includeArchived=false)', async () => {
    const spy = mockFetch(200, [cat()]);
    await getCategories();
    expect(spy).toHaveBeenCalledWith('/api/proxy/categories?includeArchived=false');
  });

  it('passes includeArchived=true when flag is set', async () => {
    const spy = mockFetch(200, [cat(), cat({ id: 'c2', isArchived: true })]);
    await getCategories(true);
    expect(spy).toHaveBeenCalledWith('/api/proxy/categories?includeArchived=true');
  });

  it('returns the parsed category array', async () => {
    mockFetch(200, [cat()]);
    const result = await getCategories();
    expect(result).toEqual([cat()]);
  });
});

describe('createCategory', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/proxy/categories with name', async () => {
    const spy = mockFetch(201, cat());
    await createCategory('Groceries');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/categories');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Groceries' });
  });

  it('returns the created category', async () => {
    mockFetch(201, cat({ id: 'new-id' }));
    const result = await createCategory('Groceries');
    expect(result?.id).toBe('new-id');
  });

  it('throws on 409 when name is already taken', async () => {
    mockFetch(409);
    await expect(createCategory('Duplicate')).rejects.toThrow('409');
  });
});

describe('renameCategory', () => {
  afterEach(() => vi.restoreAllMocks());

  it('PUTs to /api/proxy/categories/{id} with the new name', async () => {
    const spy = mockFetch(200, cat({ name: 'Food' }));
    await renameCategory('c1', 'Food');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/categories/c1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Food' });
  });

  it('returns the updated category', async () => {
    mockFetch(200, cat({ name: 'Food' }));
    const result = await renameCategory('c1', 'Food');
    expect(result?.name).toBe('Food');
  });
});

describe('mergeCategory', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/proxy/categories/{id}/merge-into/{targetId}', async () => {
    const spy = mockFetch(204);
    await mergeCategory('c1', 'c2');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/categories/c1/merge-into/c2');
    expect(init.method).toBe('POST');
  });

  it('returns null on 204', async () => {
    mockFetch(204);
    const result = await mergeCategory('c1', 'c2');
    expect(result).toBeNull();
  });
});

describe('archiveCategory', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/proxy/categories/{id}/archive', async () => {
    const spy = mockFetch(204);
    await archiveCategory('c1');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/categories/c1/archive');
    expect(init.method).toBe('POST');
  });
});

describe('unarchiveCategory', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/proxy/categories/{id}/unarchive', async () => {
    const spy = mockFetch(204);
    await unarchiveCategory('c1');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/categories/c1/unarchive');
    expect(init.method).toBe('POST');
  });

  it('throws on 409 when an active category with the same name exists', async () => {
    mockFetch(409);
    await expect(unarchiveCategory('c1')).rejects.toThrow('409');
  });
});
