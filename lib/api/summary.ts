import { apiGet } from './client';
import type { DaySummary, MonthSummary, AllTimeSummary } from '@/lib/types/api';

export const getDaySummary = (date: string) => apiGet<DaySummary>(`summary/day/${date}`);

export const getMonthSummary = (yearMonth: string) =>
  apiGet<MonthSummary>(`summary/month/${yearMonth}`);

export const getAllTimeSummary = () => apiGet<AllTimeSummary>('summary/all-time');

export const getAllTimeMonthly = () => apiGet<MonthSummary[]>('summary/all-time/monthly');
