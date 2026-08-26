import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = (): boolean => navigator.maxTouchPoints > 0;

const getServerSnapshot = (): boolean => false;

/**
 * `true` when `navigator.maxTouchPoints > 0`. This is a fixed device
 * feature that never changes while the app is running. `false` is the
 * safe default during server rendering.
 *
 * @example
 * ```tsx
 * const hasTouch = useTouchSupport();
 * ```
 */
export const useTouchSupport = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
