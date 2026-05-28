'use client';
import { useSyncExternalStore, useCallback } from 'react';
import { type ColumnKey, type ColumnPreferences, DEFAULT_COLUMN_PREFERENCES } from '@/lib/types/ui';

const STORAGE_KEY = 'niffler_column_prefs';

// Module-level store: DEFAULT_COLUMN_PREFERENCES doubles as the server snapshot.
let snapshot: ColumnPreferences = DEFAULT_COLUMN_PREFERENCES;
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  // Load from localStorage on first subscriber (client-only).
  if (snapshot === DEFAULT_COLUMN_PREFERENCES) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) snapshot = { ...DEFAULT_COLUMN_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      // corrupted storage — keep defaults
    }
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): ColumnPreferences {
  return snapshot;
}

function notify() {
  listeners.forEach((cb) => cb());
}

export function useColumnPreferences() {
  const preferences = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => DEFAULT_COLUMN_PREFERENCES
  );

  const updateLabel = useCallback((key: ColumnKey, label: string) => {
    snapshot = {
      ...snapshot,
      [key]: { ...snapshot[key], label: label.trim() || DEFAULT_COLUMN_PREFERENCES[key].label },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    notify();
  }, []);

  const toggleVisible = useCallback((key: ColumnKey) => {
    snapshot = { ...snapshot, [key]: { ...snapshot[key], visible: !snapshot[key].visible } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    notify();
  }, []);

  const updateColor = useCallback((key: ColumnKey, color: string) => {
    snapshot = { ...snapshot, [key]: { ...snapshot[key], color } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    notify();
  }, []);

  const resetAll = useCallback(() => {
    snapshot = DEFAULT_COLUMN_PREFERENCES;
    localStorage.removeItem(STORAGE_KEY);
    notify();
  }, []);

  return { preferences, updateLabel, updateColor, toggleVisible, resetAll };
}
