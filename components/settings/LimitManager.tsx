'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useLimits, useSetLimit, useDeleteLimit } from '@/lib/hooks/useLimits';
import { limitSchema } from '@/lib/validation/schemas';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { FormField } from '@/components/shared/FormField';
import { Skeleton } from '@/components/shared/Skeleton';

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
    return <Skeleton className="h-32" />;
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
          <FormField label="Amount" htmlFor="limit-amount" error={errors.amount?.message}>
            <Input
              id="limit-amount"
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-32"
            />
          </FormField>
          <FormField
            label="Effective from"
            htmlFor="limit-date"
            error={errors.effectiveFromDate?.message}
          >
            <Input id="limit-date" {...register('effectiveFromDate')} type="date" />
          </FormField>
          <div className="flex flex-col justify-end gap-1 pt-5">
            {apiError && <span className="text-xs text-[var(--color-error)]">{apiError}</span>}
            <Button type="submit" loading={setLimit.isPending}>
              Set limit
            </Button>
          </div>
        </div>
      </form>

      {sorted.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
            History
          </p>
          <ul className="flex flex-col gap-1 list-none">
            {sorted.map((entry) => (
              <li
                key={entry.effectiveFromDate}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <span className="flex-1 text-sm text-[var(--color-text-secondary)] font-mono tabular-nums">
                  {entry.effectiveFromDate}
                </span>
                <span className="text-sm font-semibold font-mono tabular-nums text-[var(--color-text-primary)]">
                  {entry.amount.toFixed(2)}
                </span>
                <Button
                  variant="text"
                  className="text-[var(--color-error)] hover:opacity-70"
                  onClick={() => setDeleteTarget(entry.effectiveFromDate)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
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
