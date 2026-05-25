'use client';
import { Button } from './Button';

interface Props {
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  destructive = false,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-backdrop)] p-4">
      <div className="w-full max-w-sm rounded-lg bg-[var(--color-surface)] p-6 shadow-lg">
        <div className="text-sm leading-relaxed mb-6 text-[var(--color-text-primary)]">
          {message}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
