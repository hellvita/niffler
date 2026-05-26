'use client';
import { useEffect, useState } from 'react';

function read() {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim();
  return {
    bar: get('--color-chart-bar'),
    limit: get('--color-chart-limit'),
    axis: get('--color-chart-axis'),
    surface: get('--color-surface'),
    border: get('--color-border'),
    text: get('--color-text-primary'),
    muted: get('--color-text-muted'),
  };
}

export function useRechartsTheme() {
  const [c, setC] = useState(read);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setC(read());
    mql.addEventListener('change', handler);
    const obs = new MutationObserver(handler);
    obs.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => {
      mql.removeEventListener('change', handler);
      obs.disconnect();
    };
  }, []);
  return c;
}
