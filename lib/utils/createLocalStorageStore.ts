type Store<T> = {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => T;
  set: (value: T) => void;
  reset: () => void;
};

/**
 * Creates a useSyncExternalStore-compatible store backed by localStorage.
 * The defaultValue reference is used as the SSR snapshot and as the sentinel
 * to detect the first subscriber (at which point localStorage is read).
 * Pass a custom `parse` function to merge stored data with defaults on load.
 */
export function createLocalStorageStore<T>(
  key: string,
  defaultValue: T,
  parse?: (raw: string) => T
): Store<T> {
  let snapshot: T = defaultValue;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((cb) => cb());
  }

  function subscribe(callback: () => void): () => void {
    if (snapshot === defaultValue) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) snapshot = parse ? parse(raw) : (JSON.parse(raw) as T);
      } catch {
        // corrupted storage — keep default
      }
    }
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function getSnapshot(): T {
    return snapshot;
  }

  function set(value: T): void {
    snapshot = value;
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  }

  function reset(): void {
    snapshot = defaultValue;
    localStorage.removeItem(key);
    notify();
  }

  return { subscribe, getSnapshot, set, reset };
}
