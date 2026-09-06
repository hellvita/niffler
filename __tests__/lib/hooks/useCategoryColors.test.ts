import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { STORAGE_KEYS } from '@/lib/constants';

// createLocalStorageStore keeps its snapshot in MODULE scope and only reads localStorage on
// its first subscriber (the `snapshot === defaultValue` identity check). The global
// afterEach in src/test/setup.ts clears localStorage but cannot reach that cached snapshot,
// so each test re-imports the hook after vi.resetModules() to get a genuinely fresh store.
async function loadHook() {
  vi.resetModules();
  const mod = await import('@/lib/hooks/useCategoryColors');
  return renderHook(() => mod.useCategoryColors());
}

const PALETTE = [
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

beforeEach(() => {
  localStorage.clear();
});

describe('useCategoryColors', () => {
  it('returns an explicitly stored color for a known id', async () => {
    // Seeded before the first render so the store picks it up on its first subscriber.
    localStorage.setItem(STORAGE_KEYS.CATEGORY_COLORS, JSON.stringify({ 'cat-1': '#123456' }));
    const { result } = await loadHook();
    expect(result.current.getColor('cat-1')).toBe('#123456');
  });

  it('falls back to a palette color for an id with no stored color', async () => {
    const { result } = await loadHook();
    expect(PALETTE).toContain(result.current.getColor('cat-unknown'));
  });

  it('returns the same fallback color for the same id across separate store instances', async () => {
    const first = await loadHook();
    const before = first.result.current.getColor('cat-stable');

    // A fresh module registry — i.e. a different screen, a reload, a different array position.
    const second = await loadHook();
    expect(second.result.current.getColor('cat-stable')).toBe(before);
  });

  it('gives a fallback color that does not depend on any surrounding array position', async () => {
    const { result } = await loadHook();
    // The old signature derived the color from an index argument; the current one takes only
    // the id, so the same id must resolve identically no matter the call order.
    const ids = ['cat-a', 'cat-b', 'cat-c'];
    const forward = ids.map((id) => result.current.getColor(id));
    const backward = [...ids].reverse().map((id) => result.current.getColor(id));
    expect(backward).toEqual([...forward].reverse());
  });

  it('persists a color set via setColor and reflects it in getColor', async () => {
    const { result } = await loadHook();
    act(() => result.current.setColor('cat-2', '#abcdef'));

    expect(result.current.getColor('cat-2')).toBe('#abcdef');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORY_COLORS)!)).toEqual({
      'cat-2': '#abcdef',
    });
  });

  it('keeps previously stored colors when setting another one', async () => {
    const { result } = await loadHook();
    act(() => result.current.setColor('cat-2', '#abcdef'));
    act(() => result.current.setColor('cat-3', '#fedcba'));

    expect(result.current.getColor('cat-2')).toBe('#abcdef');
    expect(result.current.getColor('cat-3')).toBe('#fedcba');
  });
});
