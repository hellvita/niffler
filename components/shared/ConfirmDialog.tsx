'use client';
import { Button } from './Button';
import { Modal } from './Modal';

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
    <Modal open={true} onClose={onCancel} maxWidth="sm">
      <div className="p-6">
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
    </Modal>
  );
}
