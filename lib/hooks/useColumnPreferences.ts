'use client';
import { useState, useEffect, useCallback } from 'react';
import { type ColumnKey, type ColumnPreferences, DEFAULT_COLUMN_PREFERENCES } from '@/lib/types/ui';

const STORAGE_KEY = 'niffler_column_prefs';

export function useColumnPreferences() {
  const [preferences, setPreferences] = useState<ColumnPreferences>(DEFAULT_COLUMN_PREFERENCES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPreferences(prev => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      // ignore parse errors — fall back to defaults
    }
  }, []);

  const persist = (next: ColumnPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateLabel = useCallback((key: ColumnKey, label: string) => {
    setPreferences(prev => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          label: label.trim() || DEFAULT_COLUMN_PREFERENCES[key].label,
        },
      };
      persist(next);
      return next;
    });
  }, []);

  const toggleVisible = useCallback((key: ColumnKey) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: { ...prev[key], visible: !prev[key].visible } };
      persist(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(DEFAULT_COLUMN_PREFERENCES);
  }, []);

  return { preferences, updateLabel, toggleVisible, resetAll };
}
