# @zap-studio/cache

Zero-dependency in-memory key-value cache with pluggable eviction policies, capacity limits, and optional TTL.

Full documentation: [zapstudio.dev/cache](https://www.zapstudio.dev/cache)

## Motivation

A hand-rolled `Map`-based cache without a capacity limit is a memory leak waiting to happen — nothing ever gets removed. Reaching for a library instead usually means choosing between something that bakes in one eviction algorithm (LRU only, no LFU or FIFO) or a full-featured cache far bigger than a lean cache needs (cost-based sizing, stale-while-revalidate).

`@zap-studio/cache` keeps the core cache policy-agnostic: `createCache(capacity, options?)` handles storage, capacity, and TTL, while the eviction algorithm is a small object you pass in. Five are built in — `lru()`, `lfu()`, `mru()`, `mfu()`, and `fifo()` — and the `EvictionPolicy` interface is public, so you can write your own (random replacement, ...) without forking the package.

## Installation

```bash
npm install @zap-studio/cache
```

## Quick Start

```ts
import { createCache } from "@zap-studio/cache";

const cache = createCache<string, number>(100); // lru() by default

cache.set("a", 1);
cache.get("a"); // 1
cache.has("a"); // true
cache.size; // 1
```

## Eviction Policies

`lru()` (default), `lfu()`, `mru()`, `mfu()`, and `fifo()`.

```ts
import { createCache } from "@zap-studio/cache";
import { fifo } from "@zap-studio/cache/fifo";
import { lfu } from "@zap-studio/cache/lfu";
import { lru } from "@zap-studio/cache/lru";
import { mfu } from "@zap-studio/cache/mfu";
import { mru } from "@zap-studio/cache/mru";

const lruCache = createCache<string, number>(100, { policy: lru() });
const lfuCache = createCache<string, number>(100, { policy: lfu() });
const mruCache = createCache<string, number>(100, { policy: mru() });
const mfuCache = createCache<string, number>(100, { policy: mfu() });
const fifoCache = createCache<string, number>(100, { policy: fifo() });
```

- **`lru()`** — evicts the least recently used key. Both `get` and `set` count as use.
- **`lfu()`** — evicts the least frequently used key, O(1) via frequency buckets. Ties within the same frequency break by oldest insertion.
- **`mru()`** — evicts the most recently used key, O(1) via a doubly-linked key list. The inverse of `lru()`; useful when the most recently touched entry is the least likely to be reused (e.g. cyclic scans).
- **`mfu()`** — evicts the most frequently used key, O(1) via frequency buckets. The inverse of `lfu()`; ties within the same frequency break by oldest insertion.
- **`fifo()`** — evicts the oldest inserted key. `get` never affects eviction order.

## Capacity and Eviction

`createCache(capacity, options?)` evicts one entry — chosen by the configured policy — right before an insert that would exceed `capacity`. Updating an existing key never triggers eviction.

```ts
const cache = createCache<string, number>(2);

cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3); // evicts "a" (lru default)

cache.has("a"); // false
```

## TTL

Optional and lazy — checked on `get`/`has`/`peek`, no background sweep timer. A cache-wide default via the constructor, a per-entry override via `set(...)`.

```ts
const cache = createCache<string, number>(100, { ttl: 60_000 }); // 60s default

cache.set("a", 1); // expires in 60s
cache.set("b", 2, { ttl: 5_000 }); // expires in 5s, overriding the default

// entries with no applicable ttl never expire
```

## `onEvict`

Fires on capacity or TTL eviction — not on manual `delete()` or `clear()`.

```ts
const cache = createCache<string, number>(2, {
  onEvict: (key, value) => console.log("evicted", key, value),
});
```

## `peek`

Reads a value without affecting eviction order — useful for inspection or metrics without disturbing LRU/LFU state.

```ts
cache.peek("a"); // same as get(), but no recency/frequency bump
```

## Custom Policies

`EvictionPolicy<K>` is a public interface — implement your own algorithm (random replacement, ...) as a plain object, no subclassing.

```ts
import { createCache } from "@zap-studio/cache";
import type { EvictionPolicy } from "@zap-studio/cache/types";

const random = <K>(): EvictionPolicy<K> => {
  const keys = new Set<K>();
  return {
    onGet: () => {
      // random replacement ignores access pattern
    },
    onSet: (key) => {
      keys.add(key);
    },
    onDelete: (key) => {
      keys.delete(key);
    },
    evict: () => {
      const index = Math.floor(Math.random() * keys.size);
      const victim = [...keys][index];
      if (victim !== undefined) keys.delete(victim);
      return victim;
    },
    clear: () => {
      keys.clear();
    },
  };
};

const cache = createCache<string, number>(100, { policy: random() });
```

## Iteration

`keys()`, `values()`, `entries()`, and `[Symbol.iterator]()` walk live (non-expired) entries in insertion order without affecting eviction state.

```ts
for (const [key, value] of cache) {
  console.log(key, value);
}
```

## Runtime Support

| Runtime            | Minimum version                         |
| ------------------ | --------------------------------------- |
| Node.js            | 18.0.0                                  |
| Bun                | 1.0.0                                   |
| Deno               | 1.42                                    |
| Cloudflare Workers | Any current release                     |
| Browsers           | Chrome/Edge 98, Firefox 97, Safari 15.4 |

## License

MIT
