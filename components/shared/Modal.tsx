'use client';
import { useEffect } from 'react';
import { Button } from './Button';
import { CloseIcon } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  preventClose?: boolean;
  children: React.ReactNode;
}

const maxWidthClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({
  open,
  onClose,
  title,
  maxWidth = 'md',
  preventClose = false,
  children,
}: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open || preventClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, preventClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-backdrop)] px-4"
      onClick={preventClose ? undefined : onClose}
    >
      <div
        className={`flex flex-col max-h-[90vh] w-full ${maxWidthClass[maxWidth]} rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--color-border)]">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
            {!preventClose && (
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </Button>
            )}
          </div>
        )}
        <div className="overflow-y-auto min-h-0 scrollbar-hide">{children}</div>
      </div>
    </div>
  );
}
