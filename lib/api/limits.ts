import { apiGet, apiMutate } from './client';
import type { LimitEntry } from '@/lib/types/api';

export const getLimits = () =>
  apiGet<LimitEntry[]>('limits');

export const setLimit = (effectiveFromDate: string, amount: number) =>
  apiMutate<LimitEntry>('PUT', `limits/${effectiveFromDate}`, { amount });

export const deleteLimit = (effectiveFromDate: string) =>
  apiMutate<null>('DELETE', `limits/${effectiveFromDate}`);
