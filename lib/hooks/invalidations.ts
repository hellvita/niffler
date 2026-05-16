import type { QueryClient } from '@tanstack/react-query';

export function invalidateForDate(qc: QueryClient, date: string) {
  const [year, month] = date.split('-');
  qc.invalidateQueries({ queryKey: ['summary', 'day', date] });
  qc.invalidateQueries({ queryKey: ['summary', 'month', year, month] });
  qc.invalidateQueries({ queryKey: ['summary', 'all-time'] });
}

export function invalidateForLimit(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['limits'] });
  qc.invalidateQueries({ queryKey: ['summary'] });
}

export function invalidateForCategory(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['categories'] });
  // Day summaries embed category names — bust them so the day view stays fresh
  qc.invalidateQueries({ queryKey: ['summary', 'day'] });
}
