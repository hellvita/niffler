'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertIncome, deleteIncome } from '@/lib/api/incomes';
import { invalidateForDate } from './invalidations';
import type { DaySummary } from '@/lib/types/api';

export function useUpsertIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, amount }: { date: string; amount: number }) => upsertIncome(date, amount),
    onMutate: async ({ date, amount }) => {
      await qc.cancelQueries({ queryKey: ['summary', 'day', date] });
      const previous = qc.getQueryData<DaySummary>(['summary', 'day', date]);
      qc.setQueryData<DaySummary>(['summary', 'day', date], (old) => {
        if (!old) return old;
        return { ...old, income: amount };
      });
      return { previous };
    },
    onError: (_err, { date }, ctx) => {
      qc.setQueryData(['summary', 'day', date], ctx?.previous);
    },
    onSettled: (_data, _err, { date }) => invalidateForDate(qc, date),
  });
}

export function useDeleteIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date }: { date: string }) => deleteIncome(date),
    onMutate: async ({ date }) => {
      await qc.cancelQueries({ queryKey: ['summary', 'day', date] });
      const previous = qc.getQueryData<DaySummary>(['summary', 'day', date]);
      qc.setQueryData<DaySummary>(['summary', 'day', date], (old) => {
        if (!old) return old;
        return { ...old, income: 0 };
      });
      return { previous };
    },
    onError: (_err, { date }, ctx) => {
      qc.setQueryData(['summary', 'day', date], ctx?.previous);
    },
    onSettled: (_data, _err, { date }) => invalidateForDate(qc, date),
  });
}
