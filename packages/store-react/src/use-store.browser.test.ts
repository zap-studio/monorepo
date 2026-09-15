import { createStore, derive } from "@zap-studio/store";
import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

import { useStore } from "./use-store.ts";

describe("useStore without a selector", () => {
  it("returns the store's current value", async () => {
    const counter = createStore({ count: 0 });
    const { result } = await renderHook(() => useStore(counter));

    expect(result.current).toStrictEqual({ count: 0 });
  });

  it("re-renders when the store changes", async () => {
    const counter = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const { act, result } = await renderHook(() => useStore(counter));

    await act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("stays in sync with a derive value", async () => {
    const counter = createStore({ count: 1 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const double = derive([counter], (s) => s.count * 2);
    const { act, result } = await renderHook(() => useStore(double));

    expect(result.current).toBe(2);

    await act(() => {
      counter.get().increment();
    });

    expect(result.current).toBe(4);
  });
});

describe("useStore with a selector", () => {
  it("returns only the selected value", async () => {
    const counter = createStore({ count: 0, other: 0 }, (set) => ({
      bumpOther: () => set((s) => ({ other: s.other + 1 })),
    }));
    const { result } = await renderHook(() => useStore(counter, (s) => s.count));

    expect(result.current).toBe(0);
  });

  it("re-renders when the selected value changes", async () => {
    const counter = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const { act, result } = await renderHook(() => useStore(counter, (s) => s.count));

    await act(() => {
      counter.get().increment();
    });

    expect(result.current).toBe(1);
  });

  it("does not re-render when an unrelated field changes", async () => {
    const counter = createStore({ count: 0, other: 0 }, (set) => ({
      bumpOther: () => set((s) => ({ other: s.other + 1 })),
    }));
    let renders = 0;
    const { act, result } = await renderHook(() => {
      renders += 1;
      return useStore(counter, (s) => s.count);
    });

    const rendersAfterMount = renders;

    await act(() => {
      counter.get().bumpOther();
    });

    expect(renders).toBe(rendersAfterMount);
    expect(result.current).toBe(0);
  });
});
