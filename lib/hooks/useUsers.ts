'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAccount } from '@/lib/api/users';

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.clear(),
  });
}
