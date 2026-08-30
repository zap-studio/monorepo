import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = (): boolean => navigator.cookieEnabled;

const getServerSnapshot = (): boolean => false;

/**
 * `navigator.cookieEnabled`. This value stays the same while the app runs.
 * Returns `false` during server rendering (the safe default).
 *
 * @example
 * ```tsx
 * const cookiesEnabled = useCookieEnabled();
 * ```
 */
export const useCookieEnabled = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
