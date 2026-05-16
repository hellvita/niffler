export function downloadMonthExport(yearMonth: string): void {
  const a = document.createElement('a');
  a.href = `/api/proxy/export/month/${yearMonth}`;
  a.download = `budget-${yearMonth}.xlsx`;
  a.click();
}
