'use client';
import { useState } from 'react';
import { downloadAllExportZip, downloadAllExportCombined } from '@/lib/api/export';
import { useAllTimeSummary } from '@/lib/hooks/useSummary';

export function ExportAllSection() {
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingCombined, setExportingCombined] = useState(false);
  const { data: summary } = useAllTimeSummary();

  const hasData = !!summary && (summary.totalExpenses > 0 || summary.totalIncome > 0);

  const handleZip = async () => {
    setExportingZip(true);
    try {
      await downloadAllExportZip();
    } finally {
      setExportingZip(false);
    }
  };

  const handleCombined = async () => {
    setExportingCombined(true);
    try {
      await downloadAllExportCombined();
    } finally {
      setExportingCombined(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Download all your data across every month.
      </p>
      {summary && !hasData && (
        <p className="text-xs text-[var(--color-text-muted)]">No data to export yet.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleZip}
          disabled={!hasData || exportingZip || exportingCombined}
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] disabled:opacity-40 transition-colors"
        >
          {exportingZip ? 'Exporting…' : 'Download ZIP (one file per month)'}
        </button>
        <button
          onClick={handleCombined}
          disabled={!hasData || exportingZip || exportingCombined}
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] disabled:opacity-40 transition-colors"
        >
          {exportingCombined ? 'Exporting…' : 'Download combined XLSX'}
        </button>
      </div>
    </div>
  );
}
