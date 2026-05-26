import { type SelectHTMLAttributes, forwardRef } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, Props>(({ className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={[
      'w-full rounded-lg border border-[var(--color-btn-secondary-border)]',
      'bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm',
      'px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
Select.displayName = 'Select';
