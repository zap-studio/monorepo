# State Management

**Zap.ts** uses [Zustand](https://zustand-demo.pmnd.rs/) for state management, providing a _simple_, _scalable_, and _type-safe_ way to manage application state across your app.

## Overview

- **Lightweight:** Zustand is a minimal state management library with a small bundle size.
- **Type-safe:** All stores are fully typed with TypeScript.
- **Persistent:** Easily persist state to localStorage or sessionStorage.
- **Composable:** Stores can be split by feature and composed as needed.
- **No boilerplate:** Create and use stores with minimal code.

## How it works?

### 1. Creating a store

Stores are defined in the `src/zap/stores/` directory. You can create a new store using Zustand's `create` function.

```ts
// src/stores/user.store.ts
import { create } from "zustand";

type UserState = {
  user: { id: string; name: string } | null;
  setUser: (user: { id: string; name: string } | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### 2. Using a store in components

Access and update state in your React components using the custom hook exported by your store.

```tsx
// Example usage in a component
import { useUserStore } from "@/stores/user.store";

export default function Profile() {
  const { user, setUser } = useUserStore();

  // ...
}
```

### 3. Persisting state

**Zap.ts** uses Zustand's `persist` middleware to persist state to localStorage or sessionStorage when needed.

```ts
// src/stores/theme.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme: string) => set({ theme }),
    }),
    { name: "theme-store" }
  )
);
```