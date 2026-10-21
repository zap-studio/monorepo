/**
 * MFU eviction policy: exact O(1) most-frequently-used order via
 * frequency-bucket lists.
 *
 * @module @zap-studio/cache/mfu
 */

import type { EvictionPolicy } from "./types.ts";

import { createFrequencyPolicy } from "./_frequency.ts";

/**
 * Creates an MFU (most-frequently-used) eviction policy.
 *
 * Tracks an access frequency per key and groups keys into per-frequency
 * buckets (each a `Map`, so insertion order breaks ties within a
 * frequency). Both `onGet` and a repeated `onSet` bump a key's frequency
 * and move it to the next bucket. `evict()` removes the oldest key in the
 * highest surviving frequency bucket — the inverse of `lfu()`.
 *
 * @example
 * ```ts
 * import { createCache } from "@zap-studio/cache";
 * import { mfu } from "@zap-studio/cache/mfu";
 *
 * const cache = createCache<string, number>(2, { policy: mfu() });
 * ```
 */
export const mfu = <K>(): EvictionPolicy<K> => createFrequencyPolicy<K>("most");
