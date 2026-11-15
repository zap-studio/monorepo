# TTL

TTL (time-to-live) is optional and lazy — there is no background timer sweeping expired entries. Expiry is checked when an entry is touched via `get`, `has`, or `peek`, and when `set` inserts a new key into a full cache. An entry with no applicable `ttl` never expires.

## Cache-Wide Default

Pass `ttl` (milliseconds) to `createCache(...)` to apply it to every entry that doesn't specify its own:

```ts
const cache = createCache<string, number>(100, { ttl: 60_000 }); // 60s default

cache.set("a", 1); // expires in 60s
```

## Per-Entry Override

Pass `{ ttl }` as the third argument to `set(...)` to override the cache-wide default for that entry:

```ts
const cache = createCache<string, number>(100, { ttl: 60_000 });

cache.set("a", 1); // expires in 60s (cache-wide default)
cache.set("b", 2, { ttl: 5_000 }); // expires in 5s, overriding the default
```

## No Default, No Expiry

Omitting `ttl` on both the cache and the entry means that entry never expires:

```ts
const cache = createCache<string, number>(100); // no ttl configured

cache.set("a", 1); // never expires
```

## How Expiry Is Checked

Each entry stores an absolute `expiresAt` timestamp (`Date.now() + ttl` at the time of `set`). `get`, `has`, and `peek` compare it against the current time on every call:

- **Expired**: the entry is removed from the store, [`onEvict`](on-evict.md) fires if configured, and the call returns `undefined` (`get`/`peek`) or `false` (`has`).
- **Live**: the call proceeds normally.

```ts
const cache = createCache<string, number>(2, { ttl: 100 });
cache.set("a", 1);

// ... 101ms later ...

cache.get("a"); // undefined — expired and removed
cache.has("a"); // false
```

Because expiry is lazy, an expired entry that is never read stays in the underlying store (and counts toward nothing, since `size` only counts live entries) until it is touched, or until `set` inserts a new key into a full cache — at which point every expired entry is removed (firing `onEvict`) before any live entry is evicted. With the built-in policies (or any custom policy whose `evict()` returns a stored key when asked), the store therefore never holds more than `capacity` entries, live or expired. A custom policy that returns `undefined` from `evict()` gives no such bound.

## Interaction with `size`

`size` only counts live (non-expired) entries — an expired entry that hasn't been touched yet is not counted:

```ts
const cache = createCache<string, number>(2, { ttl: 100 });
cache.set("a", 1);

// ... 101ms later, "a" still physically in the store ...

cache.size; // 0 — expired entries don't count
```

## Iteration Skips Expired Entries

`keys()`, `values()`, `entries()`, and `[Symbol.iterator]()` all skip expired entries without removing them from the store or firing `onEvict` — see [Iteration](iteration.md).

## See Also

- [`onEvict`](on-evict.md) — fires when a TTL expiry is discovered
- [Capacity and Eviction](capacity-and-eviction.md) — the other way entries leave the cache
