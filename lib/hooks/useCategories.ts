'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories, createCategory, renameCategory,
  mergeCategory, archiveCategory, unarchiveCategory,
} from '@/lib/api/categories';
import { invalidateForCategory } from './invalidations';

export function useCategories(includeArchived = false) {
  return useQuery({
    queryKey: ['categories', includeArchived],
    queryFn: () => getCategories(includeArchived),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => invalidateForCategory(qc),
  });
}

export function useRenameCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameCategory(id, name),
    onSuccess: () => invalidateForCategory(qc),
  });
}

export function useMergeCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetId }: { id: string; targetId: string }) =>
      mergeCategory(id, targetId),
    onSuccess: () => {
      // Merge moves expenses across categories — all summary levels may change
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}

export function useArchiveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveCategory(id),
    onSuccess: () => invalidateForCategory(qc),
  });
}

export function useUnarchiveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unarchiveCategory(id),
    onSuccess: () => invalidateForCategory(qc),
  });
}
