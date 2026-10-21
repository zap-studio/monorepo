/**
 * LRU eviction policy: exact least-recently-used order via a `Map`.
 *
 * @module @zap-studio/cache/lru
 */

import type { EvictionPolicy } from "./types.ts";

/**
 * Creates an LRU (least-recently-used) eviction policy.
 *
 * Both `onGet` and `onSet` move the key to the most-recently-used end.
 * Implemented with a `Map`, whose keys iterate in insertion order — a
 * delete-then-reinsert moves a key to the end in O(1), giving exact
 * (not approximate) LRU ordering.
 *
 * @example
 * ```ts
 * import { createCache } from "@zap-studio/cache";
 * import { lru } from "@zap-studio/cache/lru";
 *
 * const cache = createCache<string, number>(2, { policy: lru() });
 * ```
 */
export const lru = <K>(): EvictionPolicy<K> => {
  const order = new Map<K, true>();

  const touch = (key: K): void => {
    order.delete(key);
    order.set(key, true);
  };

  return {
    clear(): void {
      order.clear();
    },
    evict(): K | undefined {
      const oldest = order.keys().next();
      if (oldest.done) {
        return undefined;
      }

      order.delete(oldest.value);
      return oldest.value;
    },
    onDelete(key: K): void {
      order.delete(key);
    },
    onGet(key: K): void {
      touch(key);
    },
    onSet(key: K): void {
      touch(key);
    },
  };
};
