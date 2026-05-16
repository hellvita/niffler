import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadMonthExport } from '@/lib/api/export';

describe('downloadMonthExport', () => {
  afterEach(() => vi.restoreAllMocks());

  it('creates an anchor pointing to the proxy export URL and clicks it', () => {
    const click = vi.fn();
    const anchor = { href: '', download: '', click };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement);

    downloadMonthExport('2026-05');

    expect(anchor.href).toBe('/api/proxy/export/month/2026-05');
    expect(anchor.click).toHaveBeenCalledOnce();
  });

  it('sets the download filename to budget-{yearMonth}.xlsx', () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement);

    downloadMonthExport('2026-05');

    expect(anchor.download).toBe('budget-2026-05.xlsx');
  });

  it('uses the yearMonth param in both href and filename', () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement);

    downloadMonthExport('2025-12');

    expect(anchor.href).toBe('/api/proxy/export/month/2025-12');
    expect(anchor.download).toBe('budget-2025-12.xlsx');
  });
});
