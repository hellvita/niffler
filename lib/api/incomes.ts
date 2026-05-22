import { apiMutate } from './client';

export const upsertIncome = (date: string, amount: number) =>
  apiMutate<null>('PUT', `incomes/${date}`, { amount });

export const deleteIncome = (date: string) => apiMutate<null>('DELETE', `incomes/${date}`);
