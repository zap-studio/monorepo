/**
 * `useStore`: subscribes a React component to a `createStore`/`derive`
 * instance, re-rendering only when the subscribed value actually changes.
 *
 * @module @zap-studio/store-react/use-store
 */

import type { Readable } from "@zap-studio/store";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a `createStore`/`derive` instance and re-renders when its
 * value changes.
 *
 * Without `selector`, the component re-renders on every change to `store`.
 * To re-render only on the parts your component actually reads, pass a
 * `selector` — or build the exact value you need with `derive` first
 * (`derive([store], (s) => s.count)`), rather than reaching for manual
 * shallow-equality checks.
 *
 * @param store - A `createStore` or `derive` instance.
 * @param selector - Narrows the subscribed value; re-renders only when its
 *   result changes (compared with `Object.is`).
 *
 * @example
 * ```tsx
 * const count = useStore(counter, (s) => s.count);
 * ```
 */
export function useStore<T>(store: Readable<T>): T;
export function useStore<T, U>(store: Readable<T>, selector: (value: T) => U): U;
export function useStore<T, U>(store: Readable<T>, selector?: (value: T) => U): T | U {
  const getSnapshot = (): T | U => (selector ? selector(store.get()) : store.get());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
