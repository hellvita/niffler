'use client';
import { useState } from 'react';
import { downloadAllExportZip, downloadAllExportCombined } from '@/lib/api/export';

export function ExportAllSection() {
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingCombined, setExportingCombined] = useState(false);

  const handleZip = async () => {
    setExportingZip(true);
    try { await downloadAllExportZip(); } finally { setExportingZip(false); }
  };

  const handleCombined = async () => {
    setExportingCombined(true);
    try { await downloadAllExportCombined(); } finally { setExportingCombined(false); }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Download all your data across every month.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleZip}
          disabled={exportingZip || exportingCombined}
          className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
        >
          {exportingZip ? 'Exporting…' : 'Download ZIP (one file per month)'}
        </button>
        <button
          onClick={handleCombined}
          disabled={exportingZip || exportingCombined}
          className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
        >
          {exportingCombined ? 'Exporting…' : 'Download combined XLSX'}
        </button>
      </div>
    </div>
  );
}
