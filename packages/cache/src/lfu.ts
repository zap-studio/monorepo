/**
 * LFU eviction policy: exact O(1) least-frequently-used order via
 * frequency-bucket lists.
 *
 * @module @zap-studio/cache/lfu
 */

import type { EvictionPolicy } from "./types.ts";

import { createFrequencyPolicy } from "./_frequency.ts";

/**
 * Creates an LFU (least-frequently-used) eviction policy.
 *
 * Tracks an access frequency per key and groups keys into per-frequency
 * buckets (each a `Map`, so insertion order breaks ties within a
 * frequency). Both `onGet` and a repeated `onSet` bump a key's frequency
 * and move it to the next bucket. `evict()` removes the oldest key in the
 * lowest surviving frequency bucket.
 *
 * @example
 * ```ts
 * import { createCache } from "@zap-studio/cache";
 * import { lfu } from "@zap-studio/cache/lfu";
 *
 * const cache = createCache<string, number>(2, { policy: lfu() });
 * ```
 */
export const lfu = <K>(): EvictionPolicy<K> => createFrequencyPolicy<K>("least");
