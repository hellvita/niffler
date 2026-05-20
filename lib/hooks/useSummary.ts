'use client';
import { useQuery } from '@tanstack/react-query';
import { getDaySummary, getMonthSummary, getAllTimeSummary, getAllTimeMonthly } from '@/lib/api/summary';

export function useDaySummary(date: string) {
  return useQuery({
    queryKey: ['summary', 'day', date],
    queryFn: () => getDaySummary(date),
    staleTime: 30_000,
  });
}

export function useMonthSummary(yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  return useQuery({
    queryKey: ['summary', 'month', year, month],
    queryFn: () => getMonthSummary(yearMonth),
    staleTime: 30_000,
  });
}

export function useAllTimeSummary() {
  return useQuery({
    queryKey: ['summary', 'all-time'],
    queryFn: getAllTimeSummary,
    staleTime: 30_000,
  });
}

export function useAllTimeMonthlySummary(enabled: boolean) {
  return useQuery({
    queryKey: ['summary', 'all-time-monthly'],
    queryFn: getAllTimeMonthly,
    staleTime: 30_000,
    enabled,
  });
}
