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

// FNV-1a. Deterministic, dependency-free, and spreads short similar strings
// (e.g. sequential GUIDs) better than a plain character sum.
// `>>> 0` keeps the value an unsigned 32-bit int after Math.imul.
function hashToIndex(id: string, buckets: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % buckets;
}

const EMPTY: Record<string, string> = {};
const store = createLocalStorageStore<Record<string, string>>(STORAGE_KEYS.CATEGORY_COLORS, EMPTY);

export function useCategoryColors() {
  const colors = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);

  const setColor = useCallback((id: string, color: string) => {
    store.set({ ...store.getSnapshot(), [id]: color });
  }, []);

  // Falls back to a palette slot derived from the category id, NOT from array position.
  // Position-derived colors were unstable: the same category rendered a different color in
  // the settings list vs. the analytics pie (two different arrays), shifted when "show
  // archived" was toggled, and would shift again now that the pie sorts by amount. Two
  // categories may hash to the same slot; that is accepted in exchange for stability.
  const getColor = useCallback(
    (id: string): string =>
      colors[id] ?? FALLBACK_PALETTE[hashToIndex(id, FALLBACK_PALETTE.length)],
    [colors]
  );

  return { getColor, setColor };
}
