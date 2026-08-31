/**
 * Core cache implementation: a policy-agnostic `Map`-backed store with
 * capacity eviction and lazy TTL expiry.
 *
 * @module @zap-studio/cache/cache
 */

import type { Cache, CacheOptions, SetOptions } from "./types.ts";

import { lru } from "./lru.ts";

interface Entry<V> {
  value: V;
  expiresAt: number | undefined;
}

const isExpired = (entry: Entry<unknown>): boolean =>
  entry.expiresAt !== undefined && entry.expiresAt <= Date.now();

/**
 * Creates an in-memory key-value cache with a pluggable eviction policy,
 * a count-based `capacity`, and optional lazy TTL.
 *
 * @param capacity - Maximum number of live entries. Must be a positive integer.
 * @param options - Eviction policy (defaults to `lru()`), default TTL, and
 *   an `onEvict` callback fired on capacity or TTL eviction.
 * @throws {RangeError} When `capacity` is not a positive integer.
 *
 * @example
 * ```ts
 * import { createCache } from "@zap-studio/cache";
 *
 * const cache = createCache<string, number>(2);
 * cache.set("a", 1);
 * cache.get("a"); // 1
 * ```
 */
export const createCache = <K, V>(
  capacity: number,
  options: CacheOptions<K, V> = {},
): Cache<K, V> => {
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new RangeError("createCache capacity must be a positive integer.");
  }

  const policy = options.policy ?? lru<K>();
  const defaultTtl = options.ttl;
  const onEvict = options.onEvict;
  const store = new Map<K, Entry<V>>();

  const dropExpired = (key: K, entry: Entry<V>): void => {
    store.delete(key);
    onEvict?.(key, entry.value);
  };

  return {
    capacity,

    clear(): void {
      store.clear();
      policy.clear();
    },

    delete(key: K): boolean {
      const existed = store.delete(key);
      if (existed) {
        policy.onDelete(key);
      }
      return existed;
    },

    entries(): IterableIterator<[K, V]> {
      return (function* () {
        for (const [key, entry] of store) {
          if (!isExpired(entry)) {
            yield [key, entry.value];
          }
        }
      })();
    },

    get(key: K): V | undefined {
      const entry = store.get(key);
      if (entry === undefined) {
        return undefined;
      }

      if (isExpired(entry)) {
        dropExpired(key, entry);
        return undefined;
      }

      policy.onGet(key);
      return entry.value;
    },

    has(key: K): boolean {
      const entry = store.get(key);
      if (entry === undefined) {
        return false;
      }

      if (isExpired(entry)) {
        dropExpired(key, entry);
        return false;
      }

      return true;
    },

    keys(): IterableIterator<K> {
      return (function* () {
        for (const [key, entry] of store) {
          if (!isExpired(entry)) {
            yield key;
          }
        }
      })();
    },

    peek(key: K): V | undefined {
      const entry = store.get(key);
      if (entry === undefined) {
        return undefined;
      }

      if (isExpired(entry)) {
        dropExpired(key, entry);
        return undefined;
      }

      return entry.value;
    },

    set(key: K, value: V, setOptions?: SetOptions): void {
      const ttl = setOptions?.ttl ?? defaultTtl;
      const expiresAt = ttl === undefined ? undefined : Date.now() + ttl;

      if (!store.has(key) && store.size >= capacity) {
        const victimKey = policy.evict();
        if (victimKey !== undefined) {
          const victimEntry = store.get(victimKey);
          store.delete(victimKey);
          if (victimEntry !== undefined) {
            onEvict?.(victimKey, victimEntry.value);
          }
        }
      }

      store.set(key, { expiresAt, value });
      policy.onSet(key);
    },

    get size(): number {
      return store.size;
    },

    values(): IterableIterator<V> {
      return (function* () {
        for (const entry of store.values()) {
          if (!isExpired(entry)) {
            yield entry.value;
          }
        }
      })();
    },

    [Symbol.iterator](): IterableIterator<[K, V]> {
      return this.entries();
    },
  };
};
