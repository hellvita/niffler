import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const DateInput = forwardRef<HTMLInputElement, Props>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      type="date"
      className={[
        'w-full rounded border border-[var(--color-btn-secondary-border)]',
        'bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]',
        'disabled:opacity-50 focus:outline-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
DateInput.displayName = 'DateInput';
