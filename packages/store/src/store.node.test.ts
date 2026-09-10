import { describe, expect, it } from "vitest";

import { createStore } from "./store.ts";

describe("createStore persist without a window", () => {
  it("reads nothing back and swallows writes on the server", () => {
    const store = createStore(
      { count: 0 },
      (set) => ({ increment: () => set((s) => ({ count: s.count + 1 })) }),
      {
        persist: { key: "counter" },
      },
    );

    expect(store.getState()).toStrictEqual({ count: 0 });

    store.get().increment();

    expect(store.getState()).toStrictEqual({ count: 1 });
  });
});
