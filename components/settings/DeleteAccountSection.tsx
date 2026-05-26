'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteAccount } from '@/lib/hooks/useUsers';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/shared/Button';

const confirmMessage = (
  <div className="flex flex-col gap-3 text-sm leading-relaxed">
    <p>
      <strong>This action cannot be undone.</strong> All your data — expenses, incomes, categories,
      limits, and settings — will be permanently deleted.
    </p>
    <p>After deletion, you can create a new account using the same email address.</p>
    <p className="text-[var(--color-warning)]">
      We recommend <strong>exporting your data</strong> before proceeding. Use the{' '}
      <strong>Export data</strong> section above to download a complete copy of your records.
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
      <p className="text-sm text-[var(--color-text-secondary)]">
        Permanently delete your account and all associated data.
      </p>
      {apiError && <p className="text-xs text-[var(--color-error)]">{apiError}</p>}
      <div>
        <Button
          variant="destructive-outline"
          loading={deleteAccount.isPending}
          onClick={() => setShowConfirm(true)}
        >
          Delete my account
        </Button>
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
