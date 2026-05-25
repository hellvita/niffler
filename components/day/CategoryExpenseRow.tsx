'use client';
import { useEffect, useRef, useState } from 'react';
import { useUpsertExpense, useDeleteExpense } from '@/lib/hooks/useExpenses';
import {
  useCategories,
  useRenameCategory,
  useMergeCategory,
  useArchiveCategory,
} from '@/lib/hooks/useCategories';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { amountSchema } from '@/lib/validation/schemas';
import type { Category } from '@/lib/types/api';

interface Props {
  date: string;
  categoryId: string;
  categoryName: string;
  amount: number;
}

type Mode = 'view' | 'edit-amount' | 'edit-name' | 'confirm-merge' | 'confirm-archive';

export function CategoryExpenseRow({ date, categoryId, categoryName, amount }: Props) {
  const [mode, setMode] = useState<Mode>('view');
  const [menuOpen, setMenuOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [mergeTarget, setMergeTarget] = useState<Category | null>(null);

  const amountRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const escPressed = useRef(false);

  const { data: categories = [] } = useCategories(false);
  const { mutate: upsertExpense, isPending: upserting } = useUpsertExpense();
  const { mutate: deleteExpense, isPending: deleting } = useDeleteExpense();
  const { mutate: renameCategory } = useRenameCategory();
  const { mutate: mergeCategory } = useMergeCategory();
  const { mutate: archiveCategory } = useArchiveCategory();

  const isMutating = upserting || deleting;

  useEffect(() => {
    if (mode === 'edit-amount') amountRef.current?.focus();
    if (mode === 'edit-name') nameRef.current?.focus();
  }, [mode]);

  const startEditAmount = () => {
    setAmountInput(amount > 0 ? String(amount) : '');
    setMode('edit-amount');
  };

  const submitAmount = () => {
    const val = parseFloat(amountInput);
    if (isNaN(val) || val === 0) {
      setAmountError(null);
      deleteExpense({ date, categoryId }, { onSettled: () => setMode('view') });
      return;
    }
    const result = amountSchema.safeParse(val);
    if (!result.success) {
      setAmountError(result.error.issues[0]?.message ?? 'Invalid amount');
      return;
    }
    setAmountError(null);
    upsertExpense({ date, categoryId, amount: val }, { onSettled: () => setMode('view') });
  };

  const startEditName = () => {
    setNameInput(categoryName);
    setMenuOpen(false);
    setMode('edit-name');
  };

  const submitName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === categoryName) {
      setMode('view');
      return;
    }

    const existing = categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== categoryId
    );
    if (existing) {
      setMergeTarget(existing);
      setMode('confirm-merge');
      return;
    }

    renameCategory({ id: categoryId, name: trimmed }, { onSettled: () => setMode('view') });
  };

  return (
    <>
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-opacity ${
          amount > 0
            ? 'border-[var(--color-border)] bg-[var(--color-surface)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface-raised)]'
        } ${isMutating ? 'opacity-50' : ''}`}
      >
        <div className="flex-1 min-w-0">
          {mode === 'edit-name' ? (
            <input
              ref={nameRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  escPressed.current = true;
                  setMode('view');
                }
              }}
              onBlur={() => {
                if (escPressed.current) {
                  escPressed.current = false;
                  return;
                }
                submitName();
              }}
              className="w-full rounded border border-[var(--color-btn-secondary-border)] px-2 py-1 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            />
          ) : (
            <span
              className={`text-sm font-medium truncate block ${
                amount > 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {categoryName}
            </span>
          )}
        </div>

        {mode === 'edit-amount' ? (
          <div className="flex flex-col items-end gap-0.5">
            <input
              ref={amountRef}
              type="number"
              min="0"
              step="0.01"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                setAmountError(null);
              }}
              disabled={isMutating}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  escPressed.current = true;
                  setAmountError(null);
                  setMode('view');
                }
              }}
              onBlur={() => {
                if (escPressed.current) {
                  escPressed.current = false;
                  return;
                }
                submitAmount();
              }}
              className={`w-28 rounded border px-2 py-1 text-sm text-right text-[var(--color-text-primary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] disabled:opacity-50 ${
                amountError
                  ? 'border-[var(--color-error)]'
                  : 'border-[var(--color-btn-secondary-border)]'
              }`}
            />
            {amountError && (
              <span className="text-xs text-[var(--color-error)]">{amountError}</span>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              if (!isMutating && mode === 'view') startEditAmount();
            }}
            disabled={isMutating}
            className={`text-sm font-mono tabular-nums min-w-[6rem] text-right px-2 py-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors ${
              amount > 0
                ? 'text-[var(--color-text-primary)] font-semibold'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            {amount > 0 ? amount.toFixed(2) : '—'}
          </button>
        )}

        {mode !== 'edit-name' && mode !== 'edit-amount' && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Category actions"
              className="px-1.5 py-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors text-xs leading-none"
            >
              •••
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md overflow-hidden">
                  <button
                    onClick={startEditName}
                    className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setMode('confirm-archive');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {mode === 'confirm-merge' && mergeTarget && (
        <ConfirmDialog
          message={`A category named "${mergeTarget.name}" already exists. Merge "${categoryName}" into "${mergeTarget.name}"? All expenses recorded under "${categoryName}" will be moved to "${mergeTarget.name}" and "${categoryName}" will be removed.`}
          onConfirm={() =>
            mergeCategory(
              { id: categoryId, targetId: mergeTarget.id },
              {
                onSettled: () => {
                  setMode('view');
                  setMergeTarget(null);
                },
              }
            )
          }
          onCancel={() => {
            setMode('edit-name');
            setMergeTarget(null);
          }}
        />
      )}

      {mode === 'confirm-archive' && (
        <ConfirmDialog
          message="Archiving this category removes it from future day views. Expenses already entered for past dates are preserved."
          onConfirm={() => archiveCategory(categoryId, { onSettled: () => setMode('view') })}
          onCancel={() => setMode('view')}
        />
      )}
    </>
  );
}
