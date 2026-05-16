import { apiGet, apiMutate } from './client';
import type { Category } from '@/lib/types/api';

export const getCategories = (includeArchived = false) =>
  apiGet<Category[]>(`categories?includeArchived=${includeArchived}`);

export const createCategory = (name: string) =>
  apiMutate<Category>('POST', 'categories', { name });

export const renameCategory = (id: string, name: string) =>
  apiMutate<Category>('PUT', `categories/${id}`, { name });

export const mergeCategory = (id: string, targetId: string) =>
  apiMutate<null>('POST', `categories/${id}/merge-into/${targetId}`);

export const archiveCategory = (id: string) =>
  apiMutate<null>('POST', `categories/${id}/archive`);

export const unarchiveCategory = (id: string) =>
  apiMutate<null>('POST', `categories/${id}/unarchive`);
