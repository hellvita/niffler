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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
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
        onSuccess: () =>
          reset({ amount: 0, effectiveFromDate: format(new Date(), 'yyyy-MM-dd') }),
        onError: () => setApiError('Failed to save limit. Please try again.'),
      },
    );
  };

  const sorted = [...(limits ?? [])].sort((a, b) =>
    b.effectiveFromDate.localeCompare(a.effectiveFromDate),
  );
  const current = sorted[0] ?? null;

  if (isLoading) {
    return <div className="h-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Current limit summary */}
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        {current ? (
          <>Current daily limit: <strong className="font-semibold">{current.amount.toFixed(2)}</strong> (effective since {current.effectiveFromDate})</>
        ) : (
          <span className="text-zinc-400 dark:text-zinc-500">No limit set.</span>
        )}
      </p>

      {/* Set new limit */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
      >
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Set limit
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Amount</label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-32 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
            />
            {errors.amount && (
              <span className="text-xs text-red-500">{errors.amount.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Effective from</label>
            <input
              {...register('effectiveFromDate')}
              type="date"
              className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
            />
            {errors.effectiveFromDate && (
              <span className="text-xs text-red-500">{errors.effectiveFromDate.message}</span>
            )}
          </div>
          <div className="flex flex-col justify-end gap-1 pt-5">
            {apiError && <span className="text-xs text-red-500">{apiError}</span>}
            <button
              type="submit"
              disabled={setLimit.isPending}
              className="px-4 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-40 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
            >
              {setLimit.isPending ? 'Saving…' : 'Set limit'}
            </button>
          </div>
        </div>
      </form>

      {/* History list */}
      {sorted.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
            History
          </p>
          {sorted.map(entry => (
            <div
              key={entry.effectiveFromDate}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                {entry.effectiveFromDate}
              </span>
              <span className="text-sm font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {entry.amount.toFixed(2)}
              </span>
              <button
                onClick={() => setDeleteTarget(entry.effectiveFromDate)}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
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
