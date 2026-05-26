'use client';
import { useSyncExternalStore } from 'react';

const light = {
  bar: '#3b82f6',
  limit: '#f59e0b',
  axis: '#52525b',
  surface: '#ffffff',
  border: '#e4e4e7',
  text: '#18181b',
  muted: '#a1a1aa',
};

const dark = {
  bar: '#60a5fa',
  limit: '#fbbf24',
  axis: '#a1a1aa',
  surface: '#09090b',
  border: '#3f3f46',
  text: '#f4f4f5',
  muted: '#52525b',
};

function getTheme() {
  const isDark =
    document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? dark : light;
}

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', onStoreChange);
  const obs = new MutationObserver(onStoreChange);
  obs.observe(document.documentElement, { attributeFilter: ['class'] });
  return () => {
    mql.removeEventListener('change', onStoreChange);
    obs.disconnect();
  };
}

export function useRechartsTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => light);
}
