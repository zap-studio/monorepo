# @zap-studio/cache

`cache` is a zero-dependency in-memory key-value cache with pluggable eviction policies, capacity limits, and optional TTL.

## Motivation

A hand-rolled `Map`-based cache without a capacity limit is a memory leak waiting to happen — nothing ever gets removed. Reaching for a library instead usually means choosing between something that bakes in one eviction algorithm (LRU only, no LFU or FIFO) or a full-featured cache far bigger than a lean cache needs (cost-based sizing, stale-while-revalidate).

`cache` keeps the core cache policy-agnostic: `createCache(capacity, options?)` handles storage, capacity, and TTL, while the eviction algorithm is a small object you pass in. Five are built in — `lru()`, `lfu()`, `mru()`, `mfu()`, and `fifo()` — and the `EvictionPolicy` interface is public, so you can write your own without forking the package.

## Features

- **[Eviction policies](eviction-policies.md)**: `lru()` (default), `lfu()`, `mru()`, `mfu()`, and `fifo()`, swappable via `createCache(capacity, { policy })`.
- **[Capacity and eviction](capacity-and-eviction.md)**: a count-based `capacity` evicts one entry — chosen by the configured policy — right before an insert that would exceed it.
- **[TTL](ttl.md)**: optional and lazy, checked on `get`/`has`/`peek`, no background sweep timer. A cache-wide default and a per-entry override.
- **[`onEvict`](on-evict.md)**: fires on capacity or TTL eviction — not on manual `delete()` or `clear()`.
- **[`peek`](peek.md)**: reads a value without affecting eviction order.
- **[Custom policies](custom-policies.md)**: `EvictionPolicy<K>` is a public interface — implement your own algorithm (random replacement, ...) as a plain object, no subclassing.
- **[Iteration](iteration.md)**: `keys()`, `values()`, `entries()`, and `[Symbol.iterator]()` walk live entries in insertion order.
- **Tree-shakeable** — every policy has its own subpath export (`@zap-studio/cache/lru`, `/lfu`, `/mru`, `/mfu`, `/fifo`); unused policies are dropped by any modern bundler.

## Quick Start

```ts
import { createCache } from "@zap-studio/cache";

const cache = createCache<string, number>(100); // lru() by default

cache.set("a", 1);
cache.get("a"); // 1
cache.has("a"); // true
cache.size; // 1
```

## Runtime Support

| Runtime            | Minimum version                         |
| ------------------ | --------------------------------------- |
| Node.js            | 18.0.0                                  |
| Bun                | 1.0.0                                   |
| Deno               | 1.42                                    |
| Cloudflare Workers | Any current release                     |
| Browsers           | Chrome/Edge 98, Firefox 97, Safari 15.4 |

The package ships standard ESM only and uses no runtime-specific APIs. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/cache`).

## Learn More

- [Getting Started](getting-started.md) — install and build your first cache step by step
- [Eviction Policies](eviction-policies.md) — `lru()`, `lfu()`, `mru()`, `mfu()`, `fifo()`
- [Capacity and Eviction](capacity-and-eviction.md)
- [TTL](ttl.md)
- [`onEvict`](on-evict.md)
- [`peek`](peek.md)
- [Custom Policies](custom-policies.md)
- [Iteration](iteration.md)
