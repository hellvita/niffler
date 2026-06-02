'use client';
import { useSyncExternalStore, useCallback } from 'react';
import { type ColumnKey, type ColumnPreferences, DEFAULT_COLUMN_PREFERENCES } from '@/lib/types/ui';
import { STORAGE_KEYS } from '@/lib/constants';
import { createLocalStorageStore } from '@/lib/utils/createLocalStorageStore';

const store = createLocalStorageStore<ColumnPreferences>(
  STORAGE_KEYS.COLUMN_PREFERENCES,
  DEFAULT_COLUMN_PREFERENCES,
  (raw) => ({ ...DEFAULT_COLUMN_PREFERENCES, ...(JSON.parse(raw) as ColumnPreferences) })
);

export function useColumnPreferences() {
  const preferences = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => DEFAULT_COLUMN_PREFERENCES
  );

  const updateLabel = useCallback((key: ColumnKey, label: string) => {
    const cur = store.getSnapshot();
    store.set({
      ...cur,
      [key]: { ...cur[key], label: label.trim() || DEFAULT_COLUMN_PREFERENCES[key].label },
    });
  }, []);

  const toggleVisible = useCallback((key: ColumnKey) => {
    const cur = store.getSnapshot();
    store.set({ ...cur, [key]: { ...cur[key], visible: !cur[key].visible } });
  }, []);

  const updateColor = useCallback((key: ColumnKey, color: string) => {
    const cur = store.getSnapshot();
    store.set({ ...cur, [key]: { ...cur[key], color } });
  }, []);

  const resetAll = useCallback(() => {
    store.reset();
  }, []);

  return { preferences, updateLabel, updateColor, toggleVisible, resetAll };
}
