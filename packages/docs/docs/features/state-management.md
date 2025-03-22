# State Management

State management helps you store and share data across your app. In Zap.ts, we use **Zustand** as the default tool for state management. Zustand is a small, fast, and easy-to-use library for managing state in React apps. This page will give you a quick tutorial on Zustand and explain the stores we already have in Zap.ts.

## What is Zustand?

Zustand is a state management library that lets you create "stores" to hold your app’s data. A store is like a box where you keep your data and functions to change it. You can use the store in any part of your app, making it easy to share data between components.

### Why We Use Zustand

- **Simple**: It’s easy to learn and use, even for beginners.
- **Lightweight**: It’s a small library, so it doesn’t slow down your app.
- **Flexible**: You can use it for small or big apps, and it works well with React.

To learn more, check out the [Zustand documentation](https://zustand-demo.pmnd.rs/).

## Quick Zustand Tutorial

Let’s create a simple store to understand how Zustand works.

### Step 1: Create a Store

You create a store using the `create` function from Zustand. Here’s an example of a store for a counter:

```typescript
// src/stores/counter.ts
import { create } from "zustand";

interface CounterStore {
  count: number;
  increase: () => void;
  decrease: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  decrease: () => set((state) => ({ count: state.count - 1 })),
}));
```

- `create`: Makes a new store.
- `count`: The data (a number that starts at 0).
- `increase` and `decrease`: Functions to change the `count`.

### Step 2: Use the Store in a Component

Now you can use the store in any React component:

```typescript
// src/app/counter/page.tsx
"use client";

import { useCounterStore } from "@/stores/counter";

export default function CounterPage() {
  const { count, increase, decrease } = useCounterStore();

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={increase}>Add 1</button>
      <button onClick={decrease}>Subtract 1</button>
    </div>
  );
}
```

- `useCounterStore`: Gets the store so you can use its data and functions.
- `count`: Shows the current number.
- `increase` and `decrease`: Buttons call these functions to change the count.

When you click the buttons, the `count` updates, and the page shows the new number!

## Zustand Features: Subscriptions and Middleware

Zustand has some cool features that make it even better for state management.

### Subscriptions

Subscriptions let you "listen" to changes in your store and do something when the state changes. For example, you can log the state every time it updates:

```typescript
// src/stores/counter.ts
import { create } from "zustand";

interface CounterStore {
  count: number;
  increase: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
}));

// Subscribe to changes
useCounterStore.subscribe((state) => {
  console.log("Counter changed! New count:", state.count);
});
```

- `subscribe`: Runs a function every time the store’s state changes.
- In this example, it logs the new `count` whenever it changes.

### Middleware: Persist

Middleware lets you add extra features to your store. One useful middleware is `persist`, which saves your store’s state to the browser’s local storage. This means the state stays even if the user refreshes the page.

The `push-notifications` store uses `persist`:

```typescript
export const usePushNotificationsStore = create<PushNotificationsStore>()(
  persist(
    (set) => ({
      // ... store data and functions
    }),
    { name: "push-notifications" }
  )
);
```

- `persist`: Saves the store’s state to local storage under the key `push-notifications`.
- When the user reloads the page, the store loads the saved state (like the `subscription`).

You can use `persist` in your own stores too! It’s great for things like user settings or form data that you want to keep.

## More Stores in the Future

As Zap.ts grows, new plugins might add more stores. For example, a `blog` plugin might add a store for managing blog posts. Since Zustand is the default way to manage state in Zap.ts, any new stores will follow the same pattern.

## Next Steps

Now that you know how to use Zustand in Zap.ts, you can:

- Try the counter example to practice creating your own store.
- Enable the `pwa` plugin and use the `push-notifications` store to add push notifications.
- Check the [Zustand docs](https://zustand-demo.pmnd.rs/) for more features like middleware and devtools.

If you need help, ask on [X](https://www.x.com/alexandretrotel/). Happy coding! ⚡
