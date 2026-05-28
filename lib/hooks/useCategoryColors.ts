'use client';
import { useState, useEffect, useCallback } from 'react';

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

export function useCategoryColors() {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setColors(JSON.parse(raw) as Record<string, string>);
    } catch {
      // corrupted storage — leave defaults
    }
  }, []);

  const setColor = useCallback((id: string, color: string) => {
    setColors((prev) => {
      const next = { ...prev, [id]: color };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getColor = useCallback(
    (id: string, index: number): string => {
      return colors[id] ?? FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
    },
    [colors]
  );

  return { getColor, setColor };
}
