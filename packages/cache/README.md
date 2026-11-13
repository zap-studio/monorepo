# @zap-studio/cache

Zero-dependency in-memory key-value cache with pluggable eviction policies, capacity limits, and optional TTL.

Full documentation: [docs/cache](https://github.com/zap-studio/monorepo/tree/main/docs/cache)

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
