'use client';
import { useSyncExternalStore, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { createLocalStorageStore } from '@/lib/utils/createLocalStorageStore';

const FALLBACK_PALETTE = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#6366f1',
  '#14b8a6',
  '#f97316',
  '#84cc16',
];

const EMPTY: Record<string, string> = {};
const store = createLocalStorageStore<Record<string, string>>(STORAGE_KEYS.CATEGORY_COLORS, EMPTY);

export function useCategoryColors() {
  const colors = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);

  const setColor = useCallback((id: string, color: string) => {
    store.set({ ...store.getSnapshot(), [id]: color });
  }, []);

  const getColor = useCallback(
    (id: string, index: number): string =>
      colors[id] ?? FALLBACK_PALETTE[index % FALLBACK_PALETTE.length],
    [colors]
  );

  return { getColor, setColor };
}
