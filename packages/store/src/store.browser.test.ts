import { describe, expect, it, vi } from "vitest";

import { createStore } from "./store.ts";

describe("createStore get/getState", () => {
  it("returns state only from getState", () => {
    const store = createStore({ count: 0 });

    expect(store.getState()).toStrictEqual({ count: 0 });
  });

  it("returns state and actions merged from get", () => {
    const store = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));

    const snapshot = store.get();

    expect(snapshot.count).toBe(0);
    expect(typeof snapshot.increment).toBe("function");
  });

  it("returns an empty actions object when actionsFactory is omitted", () => {
    const store = createStore({ count: 0 });

    expect(store.get()).toStrictEqual({ count: 0 });
  });
});

describe("createStore set", () => {
  it("shallow-merges the updater's return value into state", () => {
    const store = createStore({ count: 0, name: "a" }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));

    store.get().increment();

    expect(store.getState()).toStrictEqual({ count: 1, name: "a" });
  });

  it("passes the previous state to the updater", () => {
    const store = createStore({ count: 5 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));

    store.get().increment();
    store.get().increment();

    expect(store.getState()).toStrictEqual({ count: 7 });
  });
});

describe("createStore subscribe", () => {
  it("notifies subscribers with state and actions merged on every set", () => {
    const store = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const listener = vi.fn<(state: { count: number; increment: () => void }) => void>();

    store.subscribe(listener);
    store.get().increment();

    expect(listener).toHaveBeenCalledExactlyOnceWith({
      count: 1,
      increment: expect.any(Function),
    });
  });

  it("stops notifying after unsubscribe", () => {
    const store = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const listener = vi.fn<(state: { count: number; increment: () => void }) => void>();

    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.get().increment();

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("createStore persist", () => {
  const memoryStorage = (): Storage => {
    const data = new Map<string, string>();
    return {
      clear: () => data.clear(),
      getItem: (key) => data.get(key) ?? null,
      key: () => null,
      length: 0,
      removeItem: (key) => {
        data.delete(key);
      },
      setItem: (key, value) => {
        data.set(key, value);
      },
    };
  };

  it("hydrates initial state from storage when a persisted value exists", () => {
    const storage = memoryStorage();
    storage.setItem("counter", JSON.stringify({ count: 42 }));

    const store = createStore({ count: 0 }, undefined, { persist: { key: "counter", storage } });

    expect(store.getState()).toStrictEqual({ count: 42 });
  });

  it("falls back to initialState when storage has nothing for the key", () => {
    const storage = memoryStorage();

    const store = createStore({ count: 0 }, undefined, { persist: { key: "counter", storage } });

    expect(store.getState()).toStrictEqual({ count: 0 });
  });

  it("falls back to initialState when the persisted value is corrupt JSON", () => {
    const storage = memoryStorage();
    storage.setItem("counter", "not json");

    const store = createStore({ count: 0 }, undefined, { persist: { key: "counter", storage } });

    expect(store.getState()).toStrictEqual({ count: 0 });
  });

  it("writes plain state, not actions, back to storage on every set", () => {
    const storage = memoryStorage();
    const store = createStore(
      { count: 0 },
      (set) => ({ increment: () => set((s) => ({ count: s.count + 1 })) }),
      { persist: { key: "counter", storage } },
    );

    store.get().increment();

    expect(JSON.parse(storage.getItem("counter") ?? "null")).toStrictEqual({ count: 1 });
  });
});

describe("createStore actions", () => {
  it("binds actions once at creation, not per get() call", () => {
    const store = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));

    expect(store.get().increment).toBe(store.get().increment);
  });
});
