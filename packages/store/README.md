# @zap-studio/store

A small state container. It works with any framework, or no framework at all. It has auto-tracked derived values and simple built-in persist.

Full documentation: [docs/store](https://github.com/zap-studio/monorepo/tree/main/docs/store)

## Installation

```bash
npm install @zap-studio/store
```

## Quick Start

```ts
import { createStore } from "@zap-studio/store";

const counter = createStore({ count: 0 }, (set, get) => ({
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

counter.get(); // { count: 0, increment: fn }
counter.getState(); // { count: 0 }

const unsubscribe = counter.subscribe((state) => console.log(state));
counter.get().increment(); // logs { count: 1, increment: fn }
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
