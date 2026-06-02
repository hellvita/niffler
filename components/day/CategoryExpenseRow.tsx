'use client';
import { useCategoryExpenseRow } from './useCategoryExpenseRow';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

interface Props {
  date: string;
  categoryId: string;
  categoryName: string;
  amount: number;
}

export function CategoryExpenseRow(props: Props) {
  const {
    mode,
    menuOpen,
    amountInput,
    amountError,
    nameInput,
    mergeTarget,
    isMutating,
    amountRef,
    nameRef,
    setMode,
    setNameInput,
    startEditAmount,
    startEditName,
    handleAmountChange,
    handleAmountKeyDown,
    handleAmountBlur,
    handleNameKeyDown,
    handleNameBlur,
    confirmMerge,
    cancelMerge,
    confirmArchive,
    cancelArchive,
    toggleMenu,
    closeMenu,
  } = useCategoryExpenseRow(props);

  const { categoryName, amount } = props;

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
            <Input
              ref={nameRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={handleNameBlur}
              className="flex-1 py-0.5 px-2 focus:outline-none focus-visible:ring-1"
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
            <Input
              ref={amountRef}
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={isMutating}
              onKeyDown={handleAmountKeyDown}
              onBlur={handleAmountBlur}
              error={!!amountError}
              className="w-28 text-right py-1 px-2"
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
            className={`text-sm font-mono tabular-nums min-w-[6rem] text-right px-2 py-1 rounded hover:bg-[var(--color-bg-secondary)] disabled:pointer-events-none transition-colors ${
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
            <Button variant="text" onClick={toggleMenu} aria-label="Category actions">
              •••
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={closeMenu} />
                <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={startEditName}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-[var(--color-error)]"
                    onClick={() => {
                      closeMenu();
                      setMode('confirm-archive');
                    }}
                  >
                    Archive
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {mode === 'confirm-merge' && mergeTarget && (
        <ConfirmDialog
          message={`A category named "${mergeTarget.name}" already exists. Merge "${categoryName}" into "${mergeTarget.name}"? All expenses recorded under "${categoryName}" will be moved to "${mergeTarget.name}" and "${categoryName}" will be removed.`}
          onConfirm={confirmMerge}
          onCancel={cancelMerge}
        />
      )}

      {mode === 'confirm-archive' && (
        <ConfirmDialog
          message="Archiving this category removes it from future day views. Expenses already entered for past dates are preserved."
          onConfirm={confirmArchive}
          onCancel={cancelArchive}
        />
      )}
    </>
  );
}
