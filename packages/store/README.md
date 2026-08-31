# @zap-studio/store

A small state container. It works with any framework, or no framework at all. It has auto-tracked derived values and simple built-in persist.

Full documentation: [zapstudio.dev/store](https://www.zapstudio.dev/store)

## Motivation

Zustand's `setState` does a shallow merge by default. This is a problem for nested state. It also has no built-in derived value: every selector runs again from scratch, with no caching.

Jotai's atom model is nice, but `jotai/utils` alone has more than a dozen helper atoms. One simple idea ("a derived value") grew into a large API.

TanStack Store has the best reactive core of the three. It uses an auto-tracked signal graph, so derived values only recompute when a real dependency changes. But `subscribe()` returns an object shaped like RxJS's `Subscription`, not a plain function. It also has no built-in persistence.

`@zap-studio/store` takes TanStack's auto-tracked reactivity and Zustand's simple, single-factory style. The public API stays small on purpose: `createStore`, `derive`, and nothing else. No middleware chain, no Provider, no atom zoo.

## Installation

```bash
npm install @zap-studio/store
```

## Features

- **One factory per store**, via `createStore(initialState, actionsFactory?, options?)`. Actions are created once, not on every render or every consumer.
- **`set` takes an updater only**: `set((prev) => partialOrFullState)`. The result is always shallow-merged. There is no `set({ ... })` shortcut, so there is no confusion between "merge" and "replace".
- **Auto-tracked derived values**, via `derive(deps, fn)`. The value is cached. It only recomputes when something `fn` actually read last time has changed. `fn` can read from any store, even one not listed in `deps`, and it will still track correctly. `deps` only sets the order and the types of the arguments.
- **Plain unsubscribe functions** — `subscribe(...)` returns `() => void`, not a `Subscription` object.
- **Simple built-in persist** — pass `{ persist: { key, storage } }` to `createStore`. `storage` only needs `getItem`, `setItem`, and `removeItem`, so `localStorage` and `sessionStorage` work as-is.
- **No required runtime dependencies.**
- **Full TypeScript inference** for state, actions, and the values passed into `derive`. You do not need to write generic types by hand.

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

## `set`

`set` only takes an updater function: `set((prev) => partialOrFullState)`. The result is always shallow-merged into the state.

```ts
const user = createStore({ name: "Ada", age: 30 }, (set) => ({
  haveBirthday: () => set((s) => ({ age: s.age + 1 })), // only `age` changes
}));
```

## `derive`

An auto-tracked, cached derived value:

```ts
import { derive } from "@zap-studio/store";

const double = derive([counter], (s) => s.count * 2);

double.get();
const unsubscribe = double.subscribe((value) => console.log(value));
```

`derive` can also depend on another `derive` value, so you can build derived values from derived values:

```ts
const quadruple = derive([double], (v) => v * 2);
```

Dependency tracking is automatic. The real dependencies are whatever `fn` reads the last time it runs — not just what is in the `deps` array. `deps` exists to give you readable, positionally-typed arguments. You can pass `[]` and read stores directly inside `fn` instead:

```ts
const double = derive([], () => counter.getState().count * 2);
```

A derived value only tells its subscribers about a change when the computed value is actually different (checked with `Object.is`). This is true even if a dependency's state changed underneath it.

## Persist

Persist is simple, and built into `createStore` — it is not a separate package:

```ts
const counter = createStore(
  { count: 0 },
  (set) => ({ increment: () => set((s) => ({ count: s.count + 1 })) }),
  { persist: { key: "counter", storage: localStorage } },
);
```

- `storage` only needs `getItem`, `setItem`, and `removeItem` — the standard `Storage` shape. So `localStorage` and `sessionStorage` work with no extra code.
- There is no version or migration system. If the stored value is corrupt or does not match, it is ignored, and `initialState` is used instead.
- Only plain state is saved. Actions (functions) are never saved.

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
