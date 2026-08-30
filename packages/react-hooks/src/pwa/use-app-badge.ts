import { useCallback } from "react";

/** The shape returned by `useAppBadge`. */
export interface UseAppBadgeResult {
  clearBadge: () => Promise<void>;
  setBadge: (count?: number) => Promise<void>;
  supported: boolean;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.setAppBadge === "function";

/**
 * Wraps the Badging API (`navigator.setAppBadge`/`clearAppBadge`), the
 * small number or dot badge shown on an installed PWA's app icon.
 * `supported` is `false` when the Badging API doesn't exist, and
 * `setBadge()`/`clearBadge()` do nothing in that case.
 *
 * @example
 * ```tsx
 * const { setBadge, clearBadge } = useAppBadge();
 * setBadge(unreadCount); // or setBadge() for a plain dot, clearBadge() to remove it
 * ```
 */
export const useAppBadge = (): UseAppBadgeResult => {
  const supported = isSupported();

  const setBadge = useCallback(async (count?: number): Promise<void> => {
    if (!isSupported()) {
      return;
    }
    await navigator.setAppBadge(count);
  }, []);

  const clearBadge = useCallback(async (): Promise<void> => {
    if (!isSupported()) {
      return;
    }
    await navigator.clearAppBadge();
  }, []);

  return { clearBadge, setBadge, supported };
};
