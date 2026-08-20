import { type WebStorageResult, useWebStorage } from "./_web-storage.ts";

/** The tuple returned by `useSessionStorage`. */
export type UseSessionStorageResult<T> = WebStorageResult<T>;

const getSessionStorage = (): Storage => window.sessionStorage;

/**
 * State synced to `sessionStorage` under `key`, JSON-serialized. Reads
 * the stored value (if any) on mount, falling back to `initialValue` when
 * nothing's stored or the stored JSON is malformed. `remove()` clears the
 * key and resets to `initialValue`. Storage read/write failures (quota
 * exceeded, private browsing) are swallowed — state still updates
 * in-memory. Unlike `useLocalStorage`, there's no cross-tab `storage`
 * event to sync — `sessionStorage` is already scoped to a single tab.
 *
 * @example
 * ```tsx
 * const [draft, setDraft, clearDraft] = useSessionStorage("draft", "");
 * ```
 */
export const useSessionStorage = <T>(key: string, initialValue: T): UseSessionStorageResult<T> =>
  useWebStorage(getSessionStorage, key, initialValue);
