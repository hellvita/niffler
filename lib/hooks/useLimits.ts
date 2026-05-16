'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLimits, setLimit, deleteLimit } from '@/lib/api/limits';
import { invalidateForLimit } from './invalidations';

export function useLimits() {
  return useQuery({
    queryKey: ['limits'],
    queryFn: getLimits,
  });
}

export function useSetLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ effectiveFromDate, amount }: { effectiveFromDate: string; amount: number }) =>
      setLimit(effectiveFromDate, amount),
    onSuccess: () => invalidateForLimit(qc),
  });
}

export function useDeleteLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (effectiveFromDate: string) => deleteLimit(effectiveFromDate),
    onSuccess: () => invalidateForLimit(qc),
  });
}
