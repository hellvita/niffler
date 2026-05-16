export async function downloadMonthExport(yearMonth: string): Promise<void> {
  const res = await fetch(`/api/proxy/export/month/${yearMonth}`);
  if (!res.ok) throw new Error(`${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-${yearMonth}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
