'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { amountSchema } from '@/lib/validation/schemas';
import { useInitialBudget, useSetInitialBudget } from '@/lib/hooks/useBudget';

const schema = z.object({ amount: amountSchema });
type FormData = z.infer<typeof schema>;

export function InitialBudgetForm() {
  const { data, isLoading } = useInitialBudget();
  const mutation = useSetInitialBudget();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 },
  });

  useEffect(() => {
    if (data !== undefined) reset({ amount: data.initialBudget });
  }, [data, reset]);

  const onSubmit = (values: FormData) => {
    mutation.mutate(values.amount, { onSuccess: () => reset({ amount: values.amount }) });
  };

  if (isLoading) {
    return <div className="h-12 w-64 rounded-lg bg-[var(--color-bg-secondary)] animate-pulse" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
          Amount
        </label>
        <input
          {...register('amount', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          disabled={mutation.isPending}
          className="w-40 px-3 py-2 rounded-lg border border-[var(--color-btn-secondary-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
        />
        {errors.amount && (
          <span className="text-xs text-[var(--color-error)]">{errors.amount.message}</span>
        )}
      </div>
      <button
        type="submit"
        disabled={mutation.isPending || !isDirty}
        className="px-4 py-2 text-sm rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium disabled:opacity-40 transition-colors hover:bg-[var(--color-btn-primary-hover)]"
      >
        {mutation.isPending ? 'Saving…' : 'Save'}
      </button>
      {mutation.isSuccess && !isDirty && (
        <span className="text-sm text-[var(--color-success)]">Saved</span>
      )}
    </form>
  );
}
