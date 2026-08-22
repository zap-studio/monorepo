import { type SetStoredValue, type WebStorageResult, useWebStorage } from "./_web-storage.ts";

export type { SetStoredValue };

/** The tuple returned by `useLocalStorage`. */
export type UseLocalStorageResult<T> = WebStorageResult<T>;

const getLocalStorage = (): Storage => window.localStorage;

/**
 * State synced to `localStorage` under `key`, JSON-serialized. Reads the
 * stored value (if any) on mount, falling back to `initialValue` when
 * nothing's stored or the stored JSON is malformed. Also syncs across
 * same-origin tabs via the `storage` event. `remove()` clears the key and
 * resets to `initialValue`. Storage read/write failures (quota exceeded,
 * private browsing) are swallowed — state still updates in-memory.
 *
 * @example
 * ```tsx
 * const [theme, setTheme, clearTheme] = useLocalStorage("theme", "light");
 * ```
 */
export const useLocalStorage = <T>(key: string, initialValue: T): UseLocalStorageResult<T> =>
  useWebStorage(getLocalStorage, key, initialValue);
