'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertExpense, deleteExpense } from '@/lib/api/expenses';
import { invalidateForDate } from './invalidations';
import type { DaySummary } from '@/lib/types/api';

interface UpsertArgs {
  date: string;
  categoryId: string;
  amount: number;
}

interface DeleteArgs {
  date: string;
  categoryId: string;
}

export function useUpsertExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, categoryId, amount }: UpsertArgs) =>
      upsertExpense(date, categoryId, amount),
    onMutate: async ({ date, categoryId, amount }) => {
      await qc.cancelQueries({ queryKey: ['summary', 'day', date] });
      const previous = qc.getQueryData<DaySummary>(['summary', 'day', date]);
      qc.setQueryData<DaySummary>(['summary', 'day', date], (old) => {
        if (!old) return old;
        return {
          ...old,
          expensesByCategory: old.expensesByCategory.map((e) =>
            e.categoryId === categoryId ? { ...e, amount } : e
          ),
        };
      });
      return { previous };
    },
    onError: (_err, { date }, ctx) => {
      qc.setQueryData(['summary', 'day', date], ctx?.previous);
    },
    onSettled: (_data, _err, { date }) => invalidateForDate(qc, date),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, categoryId }: DeleteArgs) => deleteExpense(date, categoryId),
    onMutate: async ({ date, categoryId }) => {
      await qc.cancelQueries({ queryKey: ['summary', 'day', date] });
      const previous = qc.getQueryData<DaySummary>(['summary', 'day', date]);
      qc.setQueryData<DaySummary>(['summary', 'day', date], (old) => {
        if (!old) return old;
        return {
          ...old,
          expensesByCategory: old.expensesByCategory.map((e) =>
            e.categoryId === categoryId ? { ...e, amount: 0 } : e
          ),
        };
      });
      return { previous };
    },
    onError: (_err, { date }, ctx) => {
      qc.setQueryData(['summary', 'day', date], ctx?.previous);
    },
    onSettled: (_data, _err, { date }) => invalidateForDate(qc, date),
  });
}
