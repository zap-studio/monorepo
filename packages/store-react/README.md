# @zap-studio/store-react

React bindings for [`@zap-studio/store`](https://www.npmjs.com/package/@zap-studio/store): a single `useStore` hook that subscribes a component to a `createStore`/`derive` instance.

Full documentation: [docs/store/react](https://github.com/zap-studio/monorepo/blob/main/docs/store/react.md)

## Installation

```bash
npm install @zap-studio/store-react @zap-studio/store
```

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
