/**
 * Public entrypoint for the cache package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/cache/lru`, `@zap-studio/cache/lfu`,
 * `@zap-studio/cache/mru`, `@zap-studio/cache/mfu`, `@zap-studio/cache/fifo`,
 * `@zap-studio/cache/types`) for consumers who prefer granular imports. All
 * exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/cache
 */

export { createCache } from "./cache.ts";
export { fifo } from "./fifo.ts";
export { lfu } from "./lfu.ts";
export { lru } from "./lru.ts";
export { mfu } from "./mfu.ts";
export { mru } from "./mru.ts";
export type { Cache, CacheOptions, EvictionPolicy, SetOptions } from "./types.ts";
