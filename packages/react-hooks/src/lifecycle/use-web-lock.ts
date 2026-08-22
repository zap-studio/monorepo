import { useCallback, useState } from "react";

/** Status reported by `useWebLock`. */
export type WebLockStatus = "error" | "holding" | "idle" | "released";

/** The shape returned by `useWebLock`. */
export interface UseWebLockResult {
  error: Error | undefined;
  runExclusive: <T>(callback: (lock: Lock | null) => Promise<T> | T) => Promise<T | undefined>;
  status: WebLockStatus;
  supported: boolean;
}

const isSupported = (): boolean => typeof navigator !== "undefined" && Boolean(navigator.locks);

/**
 * Wraps the Web Locks API — async mutual exclusion for a named resource,
 * shared across same-origin tabs/workers. `runExclusive(callback)` runs
 * `callback` once the `name`d lock is granted, releasing it automatically
 * when `callback` settles (success or throw) — this hook never leaks a
 * held lock. `supported: false` — the SSR-safe default — where the Web
 * Locks API doesn't exist, and `runExclusive()` then resolves `undefined`
 * without ever calling `callback`.
 *
 * @example
 * ```tsx
 * const { runExclusive, status } = useWebLock("sync-cart");
 * const total = await runExclusive(() => mergeCartFromOtherTabs());
 * ```
 */
export const useWebLock = (name: string, options?: LockOptions): UseWebLockResult => {
  const supported = isSupported();
  const [status, setStatus] = useState<WebLockStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);

  const runExclusive = useCallback(
    async <T>(callback: (lock: Lock | null) => Promise<T> | T): Promise<T | undefined> => {
      if (!isSupported()) {
        setError(new Error("Web Locks API is not supported by this browser."));
        setStatus("error");
        return undefined;
      }
      setStatus("idle");
      setError(undefined);
      try {
        const result = await navigator.locks.request(name, options ?? {}, async (lock) => {
          setStatus("holding");
          return callback(lock);
        });
        setStatus("released");
        return result;
      } catch (caught) {
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setStatus("error");
        return undefined;
      }
    },
    [name, options],
  );

  return { error, runExclusive, status, supported };
};
