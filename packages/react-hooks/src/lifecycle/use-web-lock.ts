import { useCallback, useEffect, useRef, useState } from "react";

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
 * Wraps the Web Locks API. This lets you run code so that only one tab or
 * worker can run it at a time, for a given lock `name`, even across
 * different browser tabs on the same site. `runExclusive(callback)` waits
 * until the lock is available, then runs `callback`, and always releases
 * the lock afterward, whether `callback` succeeds or throws. So the lock
 * is never left held by mistake. Returns `supported: false` when the Web
 * Locks API doesn't exist, such as during server rendering. In that case,
 * `runExclusive()` resolves to `undefined` without calling `callback`.
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

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

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
        const result = await navigator.locks.request(
          name,
          optionsRef.current ?? {},
          async (lock) => {
            setStatus("holding");
            return callback(lock);
          },
        );
        setStatus("released");
        return result;
      } catch (caught) {
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setStatus("error");
        return undefined;
      }
    },
    [name],
  );

  return { error, runExclusive, status, supported };
};
