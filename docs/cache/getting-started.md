# Getting Started

Install @zap-studio/cache and build your first cache step by step.

## Installation

```bash
# npm
npm install @zap-studio/cache
# yarn
yarn add @zap-studio/cache
# pnpm
pnpm add @zap-studio/cache
# bun
bun add @zap-studio/cache
# deno
deno add jsr:@zap-studio/cache
```

## Create a Cache

`createCache(capacity, options?)` returns a cache bounded to `capacity` live entries, using `lru()` by default.

```ts
import { createCache } from "@zap-studio/cache";

const cache = createCache<string, number>(100);
```

`capacity` must be a positive integer — `createCache` throws a `RangeError` otherwise.

## Set and Get Values

```ts
cache.set("user:1", 42);

cache.get("user:1"); // 42
cache.get("user:2"); // undefined
cache.has("user:1"); // true
```

## Let It Evict

Once the cache is full, inserting a new key evicts one entry first — which one depends on the configured [eviction policy](eviction-policies.md).

```ts
const cache = createCache<string, number>(2);

cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3); // evicts "a" (least recently used)

cache.has("a"); // false
```

Updating an existing key never triggers eviction — only an insert that grows past `capacity` does.

## Pick an Eviction Policy

Import a policy factory and pass it via `options.policy`:

```ts
import { createCache } from "@zap-studio/cache";
import { fifo } from "@zap-studio/cache/fifo";

const cache = createCache<string, number>(100, { policy: fifo() });
```

See [Eviction Policies](eviction-policies.md) for `lru()`, `lfu()`, `mru()`, `mfu()`, and `fifo()`.

## Add a TTL

Pass `ttl` (in milliseconds) to expire entries automatically. TTL is lazy — checked on `get`/`has`/`peek`, no background timer.

```ts
const cache = createCache<string, number>(100, { ttl: 60_000 });

cache.set("session:1", { userId: 1 }); // expires in 60s
```

See [TTL](ttl.md) for per-entry overrides.

> [!NOTE]
> Any function that returns a plain object implementing `EvictionPolicy<K>` works as a `policy` — see [Custom Policies](custom-policies.md) to write your own.
