async function triggerDownload(proxyPath: string, filename: string): Promise<void> {
  const res = await fetch(`/api/proxy/${proxyPath}`);
  if (!res.ok) throw new Error(`${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMonthExport(yearMonth: string): Promise<void> {
  return triggerDownload(`export/month/${yearMonth}`, `budget-${yearMonth}.xlsx`);
}

export function downloadAllExportZip(): Promise<void> {
  return triggerDownload('export/zip', 'budget-all.zip');
}

export function downloadAllExportCombined(): Promise<void> {
  return triggerDownload('export/combined', 'budget-all-time.xlsx');
}
