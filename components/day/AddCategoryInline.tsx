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
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
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
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={e => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') close();
          }}
          placeholder="Category name"
          disabled={isPending}
          className="flex-1 rounded border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-400 disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={isPending || !value.trim()}
          className="px-4 py-2 text-sm rounded bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 transition-opacity"
        >
          {isPending ? '…' : 'Add'}
        </button>
        <button
          onClick={close}
          className="px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-sm text-red-500 px-1">{error}</p>}
    </div>
  );
}
