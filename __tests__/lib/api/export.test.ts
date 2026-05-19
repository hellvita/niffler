import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadMonthExport, downloadAllExportZip, downloadAllExportCombined } from '@/lib/api/export';

function setupMocks() {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
  vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
  const anchor = { href: '', download: '', click: vi.fn() };
  vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement);
  vi.spyOn(document.body, 'appendChild').mockImplementation(n => n);
  vi.spyOn(document.body, 'removeChild').mockImplementation(n => n);
  return anchor;
}

describe('downloadMonthExport', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fetches the proxy export URL and triggers a download click', async () => {
    const anchor = setupMocks();

    await downloadMonthExport('2026-05');

    expect(anchor.href).toBe('blob:mock');
    expect(anchor.click).toHaveBeenCalledOnce();
  });

  it('sets the download filename to budget-{yearMonth}.xlsx', async () => {
    const anchor = setupMocks();

    await downloadMonthExport('2026-05');

    expect(anchor.download).toBe('budget-2026-05.xlsx');
  });

  it('uses the yearMonth param in both href and filename', async () => {
    const anchor = setupMocks();

    await downloadMonthExport('2025-12');

    expect(anchor.href).toBe('blob:mock');
    expect(anchor.download).toBe('budget-2025-12.xlsx');
  });
});

describe('downloadAllExportZip', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fetches the proxy zip URL and triggers a download click', async () => {
    const anchor = setupMocks();
    await downloadAllExportZip();
    expect(anchor.href).toBe('blob:mock');
    expect(anchor.click).toHaveBeenCalledOnce();
  });

  it('sets the download filename to budget-all.zip', async () => {
    const anchor = setupMocks();
    await downloadAllExportZip();
    expect(anchor.download).toBe('budget-all.zip');
  });
});

describe('downloadAllExportCombined', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fetches the proxy combined URL and triggers a download click', async () => {
    const anchor = setupMocks();
    await downloadAllExportCombined();
    expect(anchor.href).toBe('blob:mock');
    expect(anchor.click).toHaveBeenCalledOnce();
  });

  it('sets the download filename to budget-all-time.xlsx', async () => {
    const anchor = setupMocks();
    await downloadAllExportCombined();
    expect(anchor.download).toBe('budget-all-time.xlsx');
  });
});
