# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## 1.0.1
<sub>2026-11-15</sub>

- [#623](https://github.com/zap-studio/monorepo/pull/623)  *(patch)* Thanks [@alexandretrotel](https://github.com/alexandretrotel)!
  Reclaim expired entries in `set()` before evicting, so the cache never holds more than `capacity` entries and `onEvict` fires for expired entries that were never read. Previously, unread expired entries were kept forever and could let `size` exceed `capacity` ([#622](https://github.com/zap-studio/monorepo/issues/622)).

## [1.0.0]

### Added

- Initial release. `createCache(capacity, options?)` with a `Map`-like surface (`get`/`set`/`has`/`peek`/`delete`/`clear`, `size`/`capacity`, `keys()`/`values()`/`entries()`/`[Symbol.iterator]()`).
- Built-in eviction policies: `lru()` (default), `lfu()`, `mru()`, `mfu()`, and `fifo()`, each implementing the public `EvictionPolicy<K>` interface so consumers can supply their own.
- Optional TTL: a cache-wide default via `createCache(capacity, { ttl })` and a per-entry override via `cache.set(key, value, { ttl })`. Checked lazily on `get`/`has`/`peek`.
- `onEvict(key, value)` callback, fired on capacity and TTL eviction only — not on manual `delete`/`clear`.
