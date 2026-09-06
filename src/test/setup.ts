import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './msw/server';

// jsdom v29 under Vitest 4 ships no Web Storage, so `localStorage` is genuinely `undefined`
// here (verified empirically; Node's experimental localStorage is off without
// --localstorage-file). A bare `afterEach(() => localStorage.clear())` would therefore throw
// in a global hook and taint every test in the suite. The stub and the clear must land
// together — this is the follow-up condition recorded in
// docs/plans/2026-07/2026-07-03-niffler-pr1-quick-wins-implementation-plan.md, Step 3, now
// triggered by the first localStorage-touching test (__tests__/lib/hooks/useCategoryColors).
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  const localStorageStub: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorageStub,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  // Clears persisted storage only. Modules that cache a snapshot in module scope (see
  // lib/utils/createLocalStorageStore.ts) also need vi.resetModules() + a dynamic re-import
  // to be truly isolated — this hook cannot reach that state.
  localStorage.clear();
});
afterAll(() => server.close());
