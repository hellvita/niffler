'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInitialBudget, useSetInitialBudget } from '@/lib/hooks/useBudget';

const schema = z.object({ amount: z.number().min(0, 'Must be ≥ 0') });
type FormData = z.infer<typeof schema>;

export function InitialBudgetForm() {
  const { data, isLoading } = useInitialBudget();
  const mutation = useSetInitialBudget();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
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
    return <div className="h-12 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Amount
        </label>
        <input
          {...register('amount', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          disabled={mutation.isPending}
          className="w-40 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
        />
        {errors.amount && (
          <span className="text-xs text-red-500">{errors.amount.message}</span>
        )}
      </div>
      <button
        type="submit"
        disabled={mutation.isPending || !isDirty}
        className="px-4 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-40 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
      >
        {mutation.isPending ? 'Saving…' : 'Save'}
      </button>
      {mutation.isSuccess && !isDirty && (
        <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
      )}
    </form>
  );
}
