/**
 * MFU eviction policy: exact O(1) most-frequently-used order via
 * frequency-bucket lists.
 *
 * @module @zap-studio/cache/mfu
 */

import type { EvictionPolicy } from "./types.ts";

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
export const mfu = <K>(): EvictionPolicy<K> => {
  const frequencyByKey = new Map<K, number>();
  const bucketsByFrequency = new Map<number, Map<K, true>>();
  let maxFrequency = 1;

  const bump = (key: K): void => {
    const frequency = frequencyByKey.get(key);
    if (frequency === undefined) {
      return;
    }

    const bucket = bucketsByFrequency.get(frequency);
    bucket?.delete(key);
    if (bucket?.size === 0) {
      bucketsByFrequency.delete(frequency);
    }

    const nextFrequency = frequency + 1;
    frequencyByKey.set(key, nextFrequency);
    if (nextFrequency > maxFrequency) {
      maxFrequency = nextFrequency;
    }

    let nextBucket = bucketsByFrequency.get(nextFrequency);
    if (nextBucket === undefined) {
      nextBucket = new Map<K, true>();
      bucketsByFrequency.set(nextFrequency, nextBucket);
    }
    nextBucket.set(key, true);
  };

  return {
    clear(): void {
      frequencyByKey.clear();
      bucketsByFrequency.clear();
      maxFrequency = 1;
    },
    evict(): K | undefined {
      if (frequencyByKey.size === 0) {
        return undefined;
      }

      let bucket = bucketsByFrequency.get(maxFrequency);
      while (bucket === undefined || bucket.size === 0) {
        maxFrequency -= 1;
        bucket = bucketsByFrequency.get(maxFrequency);
      }

      const next = bucket.keys().next();
      // v8 ignore next 3 -- bucket.size > 0 here (checked by the loop above), so keys() always has a first entry.
      if (next.done) {
        return undefined;
      }

      const oldest = next.value;
      bucket.delete(oldest);
      if (bucket.size === 0) {
        bucketsByFrequency.delete(maxFrequency);
      }
      frequencyByKey.delete(oldest);

      return oldest;
    },
    onDelete(key: K): void {
      const frequency = frequencyByKey.get(key);
      if (frequency === undefined) {
        return;
      }

      const bucket = bucketsByFrequency.get(frequency);
      bucket?.delete(key);
      if (bucket?.size === 0) {
        bucketsByFrequency.delete(frequency);
      }
      frequencyByKey.delete(key);
    },
    onGet(key: K): void {
      bump(key);
    },
    onSet(key: K): void {
      if (frequencyByKey.has(key)) {
        bump(key);
        return;
      }

      frequencyByKey.set(key, 1);
      let bucket = bucketsByFrequency.get(1);
      if (bucket === undefined) {
        bucket = new Map<K, true>();
        bucketsByFrequency.set(1, bucket);
      }
      bucket.set(key, true);
    },
  };
};
