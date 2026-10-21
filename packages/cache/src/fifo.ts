/**
 * FIFO eviction policy: insertion-order queue, ignores access pattern.
 *
 * @module @zap-studio/cache/fifo
 */

import type { EvictionPolicy } from "./types.ts";

/**
 * Creates a FIFO (first-in, first-out) eviction policy.
 *
 * `onGet` is a no-op — FIFO evicts by insertion order regardless of access.
 * A repeated `onSet` on an already-tracked key does not move it.
 *
 * @example
 * ```ts
 * import { createCache } from "@zap-studio/cache";
 * import { fifo } from "@zap-studio/cache/fifo";
 *
 * const cache = createCache<string, number>(2, { policy: fifo() });
 * ```
 */
export const fifo = <K>(): EvictionPolicy<K> => {
  const queue = new Set<K>();

  return {
    clear(): void {
      queue.clear();
    },
    evict(): K | undefined {
      const oldest = queue.values().next();
      if (oldest.done) {
        return undefined;
      }

      queue.delete(oldest.value);
      return oldest.value;
    },
    onDelete(key: K): void {
      queue.delete(key);
    },
    onGet(): void {
      // FIFO ignores access pattern by design.
    },
    onSet(key: K): void {
      if (!queue.has(key)) {
        queue.add(key);
      }
    },
  };
};
