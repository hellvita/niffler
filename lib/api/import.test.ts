import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseFile, previewImport, executeImport } from './import';

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status })
  );
}

const mapping = {
  fileId: 'f1',
  dateColumnIndex: 0,
  categoryColumnIndexes: [1, 2],
  incomeColumnIndex: 3,
  scaleFactor: 1,
  invertSign: false,
};

describe('parseFile', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/proxy/import/parse with FormData containing the file', async () => {
    const spy = mockFetch(200, { fileId: 'f1', columns: [] });
    const file = new File(['data'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const result = await parseFile(file);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/import/parse');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect(result).toEqual({ fileId: 'f1', columns: [] });
  });

  it('does NOT set Content-Type header — browser must set it with the multipart boundary', async () => {
    const spy = mockFetch(200, { fileId: 'f2', columns: [] });
    const file = new File(['data'], 'data.xlsx');
    await parseFile(file);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect((init as RequestInit & { headers?: Record<string, string> }).headers).toBeUndefined();
  });

  it('includes the file under the "file" form key', async () => {
    const spy = mockFetch(200, { fileId: 'f3', columns: [] });
    const file = new File(['content'], 'test.xlsx');
    await parseFile(file);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    const formData = init.body as FormData;
    expect(formData.get('file')).toBe(file);
  });

  it('throws with the status on a non-ok response', async () => {
    mockFetch(400, { detail: 'File has multiple sheets' });
    const file = new File(['bad'], 'multi.xlsx');
    await expect(parseFile(file)).rejects.toThrow('400');
  });
});

describe('previewImport', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/proxy/import/preview with the ColumnMapping payload', async () => {
    const preview = { totalDataRows: 10, skippedRows: 0, preview: [] };
    const spy = mockFetch(200, preview);
    const result = await previewImport(mapping);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/import/preview');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(mapping);
    expect(result).toEqual(preview);
  });

  it('throws on non-ok response', async () => {
    mockFetch(400, { detail: 'Invalid mapping' });
    await expect(previewImport(mapping)).rejects.toThrow('400');
  });
});

describe('executeImport', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs to /api/proxy/import/execute with the ColumnMapping payload', async () => {
    const importResult = {
      daysImported: 5, rowsSkipped: 1, categoriesCreated: ['Food'],
      expensesUpserted: 12, incomesUpserted: 5,
    };
    const spy = mockFetch(200, importResult);
    const result = await executeImport(mapping);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/proxy/import/execute');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(mapping);
    expect(result).toEqual(importResult);
  });

  it('throws on non-ok response', async () => {
    mockFetch(422, { detail: 'File expired' });
    await expect(executeImport(mapping)).rejects.toThrow('422');
  });
});
