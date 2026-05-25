'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useLimits, useSetLimit, useDeleteLimit } from '@/lib/hooks/useLimits';
import { limitSchema } from '@/lib/validation/schemas';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

type FormData = z.infer<typeof limitSchema>;

export function LimitManager() {
  const { data: limits, isLoading } = useLimits();
  const setLimit = useSetLimit();
  const deleteLimit = useDeleteLimit();

  const [apiError, setApiError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(limitSchema),
    defaultValues: {
      amount: 0,
      effectiveFromDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (data: FormData) => {
    setApiError(null);
    setLimit.mutate(
      { effectiveFromDate: data.effectiveFromDate, amount: data.amount },
      {
        onSuccess: () => reset({ amount: 0, effectiveFromDate: format(new Date(), 'yyyy-MM-dd') }),
        onError: () => setApiError('Failed to save limit. Please try again.'),
      }
    );
  };

  const sorted = [...(limits ?? [])].sort((a, b) =>
    b.effectiveFromDate.localeCompare(a.effectiveFromDate)
  );
  const current = sorted[0] ?? null;

  if (isLoading) {
    return <div className="h-32 rounded-lg bg-[var(--color-bg-secondary)] animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-text-primary)]">
        {current ? (
          <>
            Current daily limit:{' '}
            <strong className="font-semibold">{current.amount.toFixed(2)}</strong> (effective since{' '}
            {current.effectiveFromDate})
          </>
        ) : (
          <span className="text-[var(--color-text-muted)]">No limit set.</span>
        )}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
      >
        <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
          Set limit
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-secondary)]">Amount</label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-32 px-3 py-2 rounded-lg border border-[var(--color-btn-secondary-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
            />
            {errors.amount && (
              <span className="text-xs text-[var(--color-error)]">{errors.amount.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-text-secondary)]">Effective from</label>
            <input
              {...register('effectiveFromDate')}
              type="date"
              className="px-3 py-2 rounded-lg border border-[var(--color-btn-secondary-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
            />
            {errors.effectiveFromDate && (
              <span className="text-xs text-[var(--color-error)]">
                {errors.effectiveFromDate.message}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-end gap-1 pt-5">
            {apiError && <span className="text-xs text-[var(--color-error)]">{apiError}</span>}
            <button
              type="submit"
              disabled={setLimit.isPending}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium disabled:opacity-40 transition-colors hover:bg-[var(--color-btn-primary-hover)]"
            >
              {setLimit.isPending ? 'Saving…' : 'Set limit'}
            </button>
          </div>
        </div>
      </form>

      {sorted.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
            History
          </p>
          {sorted.map((entry) => (
            <div
              key={entry.effectiveFromDate}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <span className="flex-1 text-sm text-[var(--color-text-secondary)] font-mono tabular-nums">
                {entry.effectiveFromDate}
              </span>
              <span className="text-sm font-semibold font-mono tabular-nums text-[var(--color-text-primary)]">
                {entry.amount.toFixed(2)}
              </span>
              <button
                onClick={() => setDeleteTarget(entry.effectiveFromDate)}
                className="text-xs text-[var(--color-error)] hover:opacity-70 transition-opacity"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Deleting this entry will change how allowed monthly budgets are calculated for dates on or after ${deleteTarget}. Continue?`}
          onConfirm={() => {
            deleteLimit.mutate(deleteTarget);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
