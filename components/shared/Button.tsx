'use client';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive-outline' | 'text';
type Size = 'sm' | 'md' | 'icon' | 'icon-sm';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-1';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)]',
  secondary:
    'border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)]',
  ghost:
    'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
  danger: 'bg-[var(--color-error)] text-[var(--color-text-inverse)] hover:opacity-90',
  'destructive-outline':
    'border border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error-bg)]',
  text: 'text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  icon: 'p-2',
  'icon-sm': 'p-1.5',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    { variant = 'primary', size = 'md', loading = false, className = '', children, ...props },
    ref
  ) => {
    const sizeClass = variant === 'text' ? '' : sizes[size];
    const label = loading && typeof children === 'string' ? `${children}…` : children;
    return (
      <button
        ref={ref}
        disabled={loading || props.disabled}
        className={`${base} ${variants[variant]} ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {label}
      </button>
    );
  }
);
Button.displayName = 'Button';
