# @zap-studio/store-react

React bindings for [`@zap-studio/store`](https://www.npmjs.com/package/@zap-studio/store): a single `useStore` hook that subscribes a component to a `createStore`/`derive` instance.

Full documentation: [zapstudio.dev/store/react](https://www.zapstudio.dev/store/react)

## Motivation

Zustand's React binding needs a `selector` plus a manual `shallow` equality check to avoid extra re-renders, because Zustand's own state has no built-in way to cache a derived value. `@zap-studio/store` already solves that at the source with `derive` — a computed value that is auto-tracked and cached, and only changes reference when it actually changes.

`@zap-studio/store-react` stays deliberately thin: one hook, built on React's own `useSyncExternalStore`, that reads whatever `@zap-studio/store` gives it. No middleware, no context Provider, no shallow-equality helper to reach for — build the exact value your component needs with `derive`, then subscribe to it.

## Installation

```bash
npm install @zap-studio/store-react @zap-studio/store
```

## Features

- **One hook**: `useStore(store, selector?)` — nothing else exported.
- **Works with both**: a `createStore` instance, or a `derive` value.
- **Built on `useSyncExternalStore`** — safe under React's concurrent rendering, no custom subscription-in-`useEffect` code.
- **`selector` is optional** and narrows the subscribed value; the component only re-renders when the selected result changes, compared with `Object.is`.

## Quick Start

```tsx
import { createStore, derive } from "@zap-studio/store";
import { useStore } from "@zap-studio/store-react";

const counter = createStore({ count: 0 }, (set) => ({
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

function Counter() {
  const count = useStore(counter, (s) => s.count);
  return <button onClick={() => counter.get().increment()}>{count}</button>;
}
```

## Without a Selector

`useStore(store)` re-renders on every change to `store` — both `createStore` and `derive` results are cached internally, so this is safe either way, it just re-renders on more changes than a selector would:

```tsx
const isEven = derive([counter], (s) => s.count % 2 === 0);

function Parity() {
  const even = useStore(isEven);
  return even ? "even" : "odd";
}
```

To avoid re-rendering on changes your component doesn't care about, pass a selector, or build the exact value you need with `derive` first.

## Runtime Support

| Runtime  | Minimum version                                  |
| -------- | ------------------------------------------------ |
| React    | 18.0.0                                           |
| Node.js  | 18.0.0                                           |
| Bun      | 1.0.0                                            |
| Deno     | 1.42                                             |
| Browsers | Latest evergreen (Chrome, Edge, Firefox, Safari) |

## License

MIT
