import { useCallback } from "react";

/** The shape returned by `useVibrate`. */
export interface UseVibrateResult {
  supported: boolean;
  vibrate: (pattern: VibratePattern) => boolean;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

/**
 * Wraps `navigator.vibrate()`. This mostly works on Android Chrome and
 * does nothing on other browsers. `supported` is `false` (the safe
 * default for server rendering) when `navigator.vibrate` doesn't exist,
 * and in that case `vibrate()` always returns `false`.
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
