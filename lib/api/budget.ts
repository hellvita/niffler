import { apiGet, apiMutate } from './client';
import type { BudgetResponse } from '@/lib/types/api';

export const getInitialBudget = () => apiGet<BudgetResponse>('me/budget');

export const setInitialBudget = (initialBudget: number) =>
  apiMutate<BudgetResponse>('PUT', 'me/budget', { initialBudget });
