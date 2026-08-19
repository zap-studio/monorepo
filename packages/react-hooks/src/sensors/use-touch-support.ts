import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = (): boolean => navigator.maxTouchPoints > 0;

const getServerSnapshot = (): boolean => false;

/**
 * `true` when `navigator.maxTouchPoints > 0`. A static device capability —
 * doesn't change at runtime. `false` — the SSR-safe default — during server
 * rendering.
 *
 * @example
 * ```tsx
 * const hasTouch = useTouchSupport();
 * ```
 */
export const useTouchSupport = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
