'use client';
import dynamic from 'next/dynamic';

export const ThemeToggle = dynamic(
  () => import('./ThemeToggleInner').then((m) => m.ThemeToggleInner),
  { ssr: false }
);
