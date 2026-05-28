'use client';
import { useState, useRef } from 'react';
import { downloadAllExportZip, downloadAllExportCombined } from '@/lib/api/export';
import { useAllTimeSummary } from '@/lib/hooks/useSummary';
import { Button } from '@/components/shared/Button';

export function ExportAllSection() {
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingCombined, setExportingCombined] = useState(false);
  const exportingZipRef = useRef(false);
  const exportingCombinedRef = useRef(false);
  const { data: summary } = useAllTimeSummary();

  const hasData = !!summary && (summary.totalExpenses > 0 || summary.totalIncome > 0);

  const handleZip = async () => {
    if (exportingZipRef.current) return;
    exportingZipRef.current = true;
    setExportingZip(true);
    try {
      await downloadAllExportZip();
    } finally {
      setExportingZip(false);
      exportingZipRef.current = false;
    }
  };

  const handleCombined = async () => {
    if (exportingCombinedRef.current) return;
    exportingCombinedRef.current = true;
    setExportingCombined(true);
    try {
      await downloadAllExportCombined();
    } finally {
      setExportingCombined(false);
      exportingCombinedRef.current = false;
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
        <Button
          variant="secondary"
          size="sm"
          loading={exportingZip}
          disabled={!hasData || exportingCombined}
          onClick={handleZip}
        >
          Download ZIP (one file per month)
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={exportingCombined}
          disabled={!hasData || exportingZip}
          onClick={handleCombined}
        >
          Download combined XLSX
        </Button>
      </div>
    </div>
  );
}
