/**
 * Shared frequency-bucket machinery behind the `lfu` and `mfu` policies.
 *
 * @module @zap-studio/cache/_frequency
 */

import type { EvictionPolicy } from "./types.ts";

/**
 * Which end of the frequency range `evict()` drains first.
 */
export type FrequencyOrder = "least" | "most";

/**
 * Creates a frequency-bucket eviction policy.
 *
 * Tracks an access frequency per key and groups keys into per-frequency
 * buckets (each a `Map`, so insertion order breaks ties within a
 * frequency). Both `onGet` and a repeated `onSet` bump a key's frequency
 * and move it to the next bucket. `evict()` removes the oldest key in the
 * lowest surviving bucket for `"least"`, the highest one for `"most"`.
 */
export const createFrequencyPolicy = <K>(order: FrequencyOrder): EvictionPolicy<K> => {
  const frequencyByKey = new Map<K, number>();
  const bucketsByFrequency = new Map<number, Map<K, true>>();
  const step = order === "least" ? 1 : -1;
  let targetFrequency = 1;

  const removeFromBucket = (key: K, frequency: number): void => {
    const bucket = bucketsByFrequency.get(frequency);
    bucket?.delete(key);
    if (bucket?.size === 0) {
      bucketsByFrequency.delete(frequency);
    }
  };

  const addToBucket = (key: K, frequency: number): void => {
    let bucket = bucketsByFrequency.get(frequency);
    if (bucket === undefined) {
      bucket = new Map<K, true>();
      bucketsByFrequency.set(frequency, bucket);
    }
    bucket.set(key, true);
  };

  const bump = (key: K): void => {
    const frequency = frequencyByKey.get(key);
    if (frequency === undefined) {
      return;
    }

    removeFromBucket(key, frequency);

    const nextFrequency = frequency + 1;
    frequencyByKey.set(key, nextFrequency);
    if (order === "most" && nextFrequency > targetFrequency) {
      targetFrequency = nextFrequency;
    }

    addToBucket(key, nextFrequency);
  };

  return {
    clear(): void {
      frequencyByKey.clear();
      bucketsByFrequency.clear();
      targetFrequency = 1;
    },
    evict(): K | undefined {
      if (frequencyByKey.size === 0) {
        return undefined;
      }

      let bucket = bucketsByFrequency.get(targetFrequency);
      while (bucket === undefined || bucket.size === 0) {
        targetFrequency += step;
        bucket = bucketsByFrequency.get(targetFrequency);
      }

      const next = bucket.keys().next();
      // v8 ignore next 3 -- bucket.size > 0 here (checked by the loop above), so keys() always has a first entry.
      if (next.done) {
        return undefined;
      }

      const oldest = next.value;
      bucket.delete(oldest);
      if (bucket.size === 0) {
        bucketsByFrequency.delete(targetFrequency);
      }
      frequencyByKey.delete(oldest);

      return oldest;
    },
    onDelete(key: K): void {
      const frequency = frequencyByKey.get(key);
      if (frequency === undefined) {
        return;
      }

      removeFromBucket(key, frequency);
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
      addToBucket(key, 1);
      if (order === "least") {
        targetFrequency = 1;
      }
    },
  };
};
