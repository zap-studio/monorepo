import { type WebStorageResult, useWebStorage } from "./_web-storage.ts";

/** The tuple returned by `useSessionStorage`. */
export type UseSessionStorageResult<T> = WebStorageResult<T>;

const getSessionStorage = (): Storage => window.sessionStorage;

/**
 * State synced to `sessionStorage` under `key`, stored as JSON. Reads the
 * stored value when the component mounts, and falls back to
 * `initialValue` if nothing is stored or the stored JSON is invalid.
 * `remove()` clears the key and resets the value to `initialValue`. If
 * reading or writing storage fails (for example: quota exceeded, private
 * browsing), the error is ignored and the state still updates in memory.
 * Unlike `useLocalStorage`, there's no `storage` event to sync across
 * tabs, because `sessionStorage` only exists in a single tab.
 *
 * @example
 * ```tsx
 * const [draft, setDraft, clearDraft] = useSessionStorage("draft", "");
 * ```
 */
export const useSessionStorage = <T>(key: string, initialValue: T): UseSessionStorageResult<T> =>
  useWebStorage(getSessionStorage, key, initialValue);
