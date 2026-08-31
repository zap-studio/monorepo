/**
 * Public type contracts for cache eviction policies and the cache surface.
 *
 * @module @zap-studio/cache/types
 */

/**
 * Eviction policy contract consumed by `createCache(...)`.
 *
 * Implementations own all ordering/eviction state privately — the core
 * cache never inspects it directly, only calls these hooks.
 *
 * @example
 * const policy: EvictionPolicy<string> = {
 *   onGet: (key) => {},
 *   onSet: (key) => {},
 *   onDelete: (key) => {},
 *   evict: () => undefined,
 *   clear: () => {},
 * };
 */
export interface EvictionPolicy<K> {
  /**
   * Called after a live (non-expired) read via `Cache.get(...)`.
   *
   * Not called for `Cache.peek(...)`.
   */
  onGet: (key: K) => void;
  /**
   * Called after `Cache.set(...)` inserts or updates `key`.
   */
  onSet: (key: K) => void;
  /**
   * Called after `Cache.delete(...)` removes `key`.
   *
   * Not called for capacity or TTL evictions — only manual deletes.
   */
  onDelete: (key: K) => void;
  /**
   * Returns the key to remove when the cache is over capacity, or
   * `undefined` when the policy has nothing to evict.
   */
  evict: () => K | undefined;
  /**
   * Resets all internal policy state, called by `Cache.clear(...)`.
   */
  clear: () => void;
}

/**
 * Options for `createCache(...)`.
 *
 * @example
 * const options: CacheOptions<string, number> = {
 *   ttl: 60_000,
 *   onEvict: (key, value) => console.log("evicted", key, value),
 * };
 */
export interface CacheOptions<K, V> {
  /**
   * Eviction policy used to pick a victim key when the cache is over
   * capacity.
   *
   * @default lru()
   */
  readonly policy?: EvictionPolicy<K>;
  /**
   * Default time-to-live in milliseconds applied to entries that don't
   * specify their own `ttl` via `Cache.set(key, value, { ttl })`.
   *
   * Omitted (together with a per-entry override) means the entry never
   * expires.
   */
  readonly ttl?: number;
  /**
   * Called when an entry is removed by capacity or TTL eviction.
   *
   * Not called for manual `Cache.delete(...)` or `Cache.clear(...)`.
   */
  readonly onEvict?: (key: K, value: V) => void;
}

/**
 * Per-entry options for `Cache.set(...)`.
 *
 * @example
 * const options: SetOptions = { ttl: 5_000 };
 */
export interface SetOptions {
  /**
   * Time-to-live in milliseconds for this entry, overriding the cache-wide
   * default from `CacheOptions.ttl`.
   */
  readonly ttl?: number;
}

/**
 * Cache instance returned by `createCache(...)`.
 *
 * @example
 * const cache: Cache<string, number> = createCache(100);
 * cache.set("a", 1);
 * cache.get("a"); // 1
 */
export interface Cache<K, V> {
  /**
   * Returns the value for `key`, or `undefined` when absent or expired.
   *
   * Bumps the eviction policy (e.g. marks LRU/LFU recency) on a live hit.
   */
  get: (key: K) => V | undefined;
  /**
   * Inserts or updates `key` with `value`.
   *
   * When the cache is at capacity and `key` is new, evicts one entry first
   * via the configured policy and fires `onEvict`.
   */
  set: (key: K, value: V, options?: SetOptions) => void;
  /**
   * Returns whether `key` is present and not expired.
   */
  has: (key: K) => boolean;
  /**
   * Returns the value for `key` without updating the eviction policy.
   *
   * Still respects TTL expiry.
   */
  peek: (key: K) => V | undefined;
  /**
   * Removes `key`. Returns `true` when an entry was removed.
   *
   * Does not fire `onEvict` — that callback is reserved for capacity/TTL
   * evictions.
   */
  delete: (key: K) => boolean;
  /**
   * Removes all entries and resets the eviction policy.
   *
   * Does not fire `onEvict` per removed entry.
   */
  clear: () => void;
  /**
   * Current number of live entries.
   */
  readonly size: number;
  /**
   * Maximum number of entries before eviction kicks in.
   */
  readonly capacity: number;
  /**
   * Iterates live entry keys in insertion order.
   */
  keys: () => IterableIterator<K>;
  /**
   * Iterates live entry values in insertion order.
   */
  values: () => IterableIterator<V>;
  /**
   * Iterates live `[key, value]` pairs in insertion order.
   */
  entries: () => IterableIterator<[K, V]>;
  /**
   * Iterates live `[key, value]` pairs in insertion order.
   */
  [Symbol.iterator]: () => IterableIterator<[K, V]>;
}
