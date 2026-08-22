import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = (): boolean => navigator.cookieEnabled;

const getServerSnapshot = (): boolean => false;

/**
 * `navigator.cookieEnabled`. A static capability — doesn't change at
 * runtime. `false` — the SSR-safe default — during server rendering.
 *
 * @example
 * ```tsx
 * const cookiesEnabled = useCookieEnabled();
 * ```
 */
export const useCookieEnabled = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
