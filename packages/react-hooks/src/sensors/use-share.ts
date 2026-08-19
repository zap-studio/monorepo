import { useCallback } from "react";

/** The shape returned by `useShare`. */
export interface UseShareResult {
  canShare: (data?: ShareData) => boolean;
  share: (data: ShareData) => Promise<void>;
  supported: boolean;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

/**
 * Wraps the Web Share API (`navigator.share()`), with `canShare` support
 * feature-detection. `supported: false` — the SSR-safe default — where
 * `navigator.share` doesn't exist.
 *
 * @example
 * ```tsx
 * const { share, canShare, supported } = useShare();
 * const data = { title: "Zap Studio", url: location.href };
 * if (supported && canShare(data)) await share(data);
 * ```
 */
export const useShare = (): UseShareResult => {
  const supported = isSupported();

  const share = useCallback(async (data: ShareData): Promise<void> => {
    await navigator.share(data);
  }, []);

  const canShare = useCallback(
    (data?: ShareData): boolean =>
      typeof navigator.canShare === "function" ? navigator.canShare(data) : isSupported(),
    [],
  );

  return { canShare, share, supported };
};
