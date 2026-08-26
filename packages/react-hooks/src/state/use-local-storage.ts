import { type SetStoredValue, type WebStorageResult, useWebStorage } from "./_web-storage.ts";

export type { SetStoredValue };

/** The tuple returned by `useLocalStorage`. */
export type UseLocalStorageResult<T> = WebStorageResult<T>;

const getLocalStorage = (): Storage => window.localStorage;

/**
 * State synced to `localStorage` under `key`, stored as JSON. Reads the
 * stored value when the component mounts, and falls back to
 * `initialValue` if nothing is stored or the stored JSON is invalid. Also
 * syncs across tabs on the same origin, using the `storage` event.
 * `remove()` clears the key and resets the value to `initialValue`. If
 * reading or writing storage fails (for example: quota exceeded, private
 * browsing), the error is ignored and the state still updates in memory.
 *
 * @example
 * ```tsx
 * const [theme, setTheme, clearTheme] = useLocalStorage("theme", "light");
 * ```
 */
export const useLocalStorage = <T>(key: string, initialValue: T): UseLocalStorageResult<T> =>
  useWebStorage(getLocalStorage, key, initialValue);
