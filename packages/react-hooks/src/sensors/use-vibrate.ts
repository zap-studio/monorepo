import { useCallback } from "react";

export interface UseVibrateResult {
  supported: boolean;
  vibrate: (pattern: VibratePattern) => boolean;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

/**
 * Wraps `navigator.vibrate()` — mostly Android Chrome; no-op elsewhere.
 * `supported: false` — the SSR-safe default — where `navigator.vibrate`
 * doesn't exist, and `vibrate()` then always returns `false`.
 *
 * @example
 * ```tsx
 * const { vibrate, supported } = useVibrate();
 * if (supported) vibrate([100, 50, 100]);
 * ```
 */
export const useVibrate = (): UseVibrateResult => {
  const supported = isSupported();

  const vibrate = useCallback(
    (pattern: VibratePattern): boolean => (isSupported() ? navigator.vibrate(pattern) : false),
    [],
  );

  return { supported, vibrate };
};
