'use client';
import { useEffect } from 'react';
import { Button } from './Button';

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
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </div>
        )}
        <div className="overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
}
