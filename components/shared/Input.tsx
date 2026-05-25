import { type InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ error = false, className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={[
        'w-full rounded border',
        error ? 'border-[var(--color-error)]' : 'border-[var(--color-btn-secondary-border)]',
        'bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]',
        'placeholder:text-[var(--color-text-muted)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]',
        'disabled:opacity-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
Input.displayName = 'Input';
