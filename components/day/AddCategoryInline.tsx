'use client';
import { useRef, useState } from 'react';
import { useCreateCategory } from '@/lib/hooks/useCategories';
import { categoryNameSchema } from '@/lib/validation/schemas';

export function AddCategoryInline() {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createCategory, isPending } = useCreateCategory();

  const open = () => {
    setActive(true);
    setValue('');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const close = () => {
    setActive(false);
    setValue('');
    setError('');
  };

  const submit = () => {
    const trimmed = value.trim();
    const validation = categoryNameSchema.safeParse(trimmed);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid name');
      return;
    }
    createCategory(trimmed, {
      onSuccess: close,
      onError: (err: unknown) => {
        const apiErr = err as { status?: number };
        setError(
          apiErr.status === 409
            ? 'A category with this name already exists.'
            : 'Failed to create category.'
        );
      },
    });
  };

  if (!active) {
    return (
      <button
        onClick={open}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-lg border border-dashed border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
      >
        <span className="text-base leading-none font-light">+</span>
        Add category
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') close();
          }}
          placeholder="Category name"
          disabled={isPending}
          className="flex-1 rounded border border-[var(--color-btn-secondary-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={isPending || !value.trim()}
          className="px-4 py-2 text-sm rounded bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] disabled:opacity-40 transition-opacity hover:bg-[var(--color-btn-primary-hover)]"
        >
          {isPending ? '…' : 'Add'}
        </button>
        <button
          onClick={close}
          className="px-3 py-2 text-sm rounded border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-error)] px-1">{error}</p>}
    </div>
  );
}
