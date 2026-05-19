'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteAccount } from '@/lib/hooks/useUsers';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const confirmMessage = (
  <div className="flex flex-col gap-3 text-sm leading-relaxed">
    <p>
      <strong>This action cannot be undone.</strong> All your data — expenses, incomes, categories,
      limits, and settings — will be permanently deleted.
    </p>
    <p>
      After deletion, you can create a new account using the same email address.
    </p>
    <p className="text-amber-700">
      We recommend{' '}
      <strong>exporting your data</strong> before proceeding. Use the{' '}
      <strong>Export data</strong> section above to download a complete copy of
      your records.
    </p>
  </div>
);

export function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const deleteAccount = useDeleteAccount();

  const handleConfirm = () => {
    setApiError(null);
    deleteAccount.mutate(undefined, {
      onSuccess: () => router.push('/login'),
      onError: () => {
        setShowConfirm(false);
        setApiError('Failed to delete account. Please try again.');
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Permanently delete your account and all associated data.
      </p>
      {apiError && <p className="text-xs text-red-500">{apiError}</p>}
      <div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={deleteAccount.isPending}
          className="px-4 py-2 text-sm rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40 transition-colors"
        >
          {deleteAccount.isPending ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={confirmMessage}
          confirmLabel="Delete my account"
          destructive
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
