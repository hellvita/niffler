'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInitialBudget, setInitialBudget } from '@/lib/api/budget';

export function useInitialBudget() {
  return useQuery({
    queryKey: ['budget'],
    queryFn: getInitialBudget,
  });
}

export function useSetInitialBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (initialBudget: number) => setInitialBudget(initialBudget),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] });
      qc.invalidateQueries({ queryKey: ['summary', 'all-time'] });
    },
  });
}
