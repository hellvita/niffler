'use client';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  'inline-flex items-center justify-center rounded font-medium transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-1';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)]',
  secondary:
    'border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)]',
  danger: 'bg-[var(--color-error)] text-[var(--color-text-inverse)] hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...props}
    />
  )
);
Button.displayName = 'Button';
