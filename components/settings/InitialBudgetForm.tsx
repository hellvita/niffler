'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { amountSchema } from '@/lib/validation/schemas';
import { useInitialBudget, useSetInitialBudget } from '@/lib/hooks/useBudget';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { FormField } from '@/components/shared/FormField';
import { Skeleton } from '@/components/shared/Skeleton';

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
    return <Skeleton className="h-12 w-64" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
      <FormField label="Initial budget" htmlFor="budget-amount" error={errors.amount?.message}>
        <Input
          id="budget-amount"
          {...register('amount', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          disabled={mutation.isPending}
          className="w-40"
        />
      </FormField>
      <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
        Save
      </Button>
      {mutation.isSuccess && !isDirty && (
        <span className="text-sm text-[var(--color-success)]">Saved</span>
      )}
    </form>
  );
}
