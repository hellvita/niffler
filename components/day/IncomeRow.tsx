'use client';
import { useEffect, useRef, useState } from 'react';
import { useUpsertIncome, useDeleteIncome } from '@/lib/hooks/useIncomes';
import { amountSchema } from '@/lib/validation/schemas';
import { Input } from '@/components/shared/Input';

export function IncomeRow({ date, income }: { date: string; income: number }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const escPressed = useRef(false);

  const { mutate: upsertIncome, isPending: upserting } = useUpsertIncome();
  const { mutate: deleteIncome, isPending: deleting } = useDeleteIncome();
  const isMutating = upserting || deleting;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setInputValue(income > 0 ? String(income) : '');
    setEditing(true);
  };

  const submit = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val === 0) {
      setInputError(null);
      deleteIncome({ date }, { onSettled: () => setEditing(false) });
      return;
    }
    const result = amountSchema.safeParse(val);
    if (!result.success) {
      setInputError(result.error.issues[0]?.message ?? 'Invalid amount');
      return;
    }
    setInputError(null);
    upsertIncome({ date, amount: val }, { onSettled: () => setEditing(false) });
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-opacity ${
        isMutating ? 'opacity-50' : ''
      }`}
    >
      <span className="flex-1 text-sm font-medium text-[var(--color-text-secondary)] italic">
        Income
      </span>

      {editing ? (
        <div className="flex flex-col items-end gap-0.5">
          <Input
            ref={inputRef}
            type="number"
            min="0"
            step="0.01"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputError(null);
            }}
            disabled={isMutating}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                escPressed.current = true;
                setInputError(null);
                setEditing(false);
              }
            }}
            onBlur={() => {
              if (escPressed.current) {
                escPressed.current = false;
                return;
              }
              submit();
            }}
            error={!!inputError}
            className="w-28 text-right py-1 px-2"
          />
          {inputError && <span className="text-xs text-[var(--color-error)]">{inputError}</span>}
        </div>
      ) : (
        <button
          onClick={startEdit}
          disabled={isMutating}
          className={`text-sm font-mono tabular-nums min-w-[6rem] text-right px-2 py-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors ${
            income > 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
          }`}
        >
          {income > 0 ? income.toFixed(2) : '—'}
        </button>
      )}
    </div>
  );
}
