'use client';
import { useSyncExternalStore, useCallback } from 'react';

const STORAGE_KEY = 'niffler_category_colors';
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

// Module-level store: stable empty reference doubles as the server snapshot.
const EMPTY: Record<string, string> = {};
let snapshot: Record<string, string> = EMPTY;
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  // Load from localStorage on first subscriber (client-only).
  if (snapshot === EMPTY) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) snapshot = JSON.parse(raw) as Record<string, string>;
    } catch {
      // corrupted storage — keep empty
    }
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Record<string, string> {
  return snapshot;
}

export function useCategoryColors() {
  const colors = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const setColor = useCallback((id: string, color: string) => {
    snapshot = { ...snapshot, [id]: color };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    listeners.forEach((cb) => cb());
  }, []);

  const getColor = useCallback(
    (id: string, index: number): string =>
      colors[id] ?? FALLBACK_PALETTE[index % FALLBACK_PALETTE.length],
    [colors]
  );

  return { getColor, setColor };
}
