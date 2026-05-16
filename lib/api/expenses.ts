import { apiMutate } from './client';

export const upsertExpense = (date: string, categoryId: string, amount: number) =>
  apiMutate<null>('PUT', `expenses/${date}/${categoryId}`, { amount });

export const deleteExpense = (date: string, categoryId: string) =>
  apiMutate<null>('DELETE', `expenses/${date}/${categoryId}`);
