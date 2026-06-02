'use client';
import { useQuery } from '@tanstack/react-query';
import {
  getDaySummary,
  getMonthSummary,
  getAllTimeSummary,
  getAllTimeMonthly,
} from '@/lib/api/summary';
import { QUERY_STALE_TIME_MS } from '@/lib/constants';

export function useDaySummary(date: string) {
  return useQuery({
    queryKey: ['summary', 'day', date],
    queryFn: () => getDaySummary(date),
    staleTime: QUERY_STALE_TIME_MS,
  });
}

export function useMonthSummary(yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  return useQuery({
    queryKey: ['summary', 'month', year, month],
    queryFn: () => getMonthSummary(yearMonth),
    staleTime: QUERY_STALE_TIME_MS,
  });
}

export function useAllTimeSummary() {
  return useQuery({
    queryKey: ['summary', 'all-time'],
    queryFn: getAllTimeSummary,
    staleTime: QUERY_STALE_TIME_MS,
  });
}

export function useAllTimeMonthlySummary(enabled: boolean) {
  return useQuery({
    queryKey: ['summary', 'all-time-monthly'],
    queryFn: getAllTimeMonthly,
    staleTime: QUERY_STALE_TIME_MS,
    enabled,
  });
}
