import { describe, expect, it, vi } from "vitest";

import { derive } from "./derive.ts";
import { createStore } from "./store.ts";

describe("derive get", () => {
  it("computes the value from a single dependency", () => {
    const counter = createStore({ count: 3 });
    const double = derive([counter], (s) => s.count * 2);

    expect(double.get()).toBe(6);
  });

  it("computes the value from multiple dependencies, positionally", () => {
    const a = createStore({ value: 2 });
    const b = createStore({ value: 3 });
    const sum = derive([a, b], (av, bv) => av.value + bv.value);

    expect(sum.get()).toBe(5);
  });

  it("recomputes after a dependency changes", () => {
    const counter = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const double = derive([counter], (s) => s.count * 2);

    expect(double.get()).toBe(0);
    counter.get().increment();
    expect(double.get()).toBe(2);
  });

  it("caches the value: recompute does not run again for an unrelated read", () => {
    const counter = createStore({ count: 1, other: 0 }, (set) => ({
      bumpOther: () => set((s) => ({ other: s.other + 1 })),
    }));
    const compute = vi.fn<(s: { count: number; other: number }) => number>((s) => s.count * 2);
    const double = derive([counter], compute);

    double.get();
    double.get();

    expect(compute).toHaveBeenCalledOnce();
  });

  it("auto-tracks reads not listed in deps, so recompute stays correct", () => {
    const counter = createStore({ count: 1 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    // `deps` is empty on purpose: fn reads `counter` directly.
    const double = derive([], () => counter.getState().count * 2);

    expect(double.get()).toBe(2);
    counter.get().increment();
    expect(double.get()).toBe(4);
  });

  it("supports derive-of-derive", () => {
    const counter = createStore({ count: 2 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const double = derive([counter], (s) => s.count * 2);
    const quadruple = derive([double], (v) => v * 2);

    expect(quadruple.get()).toBe(8);
    counter.get().increment();
    expect(quadruple.get()).toBe(12);
  });
});

describe("derive subscribe", () => {
  it("notifies subscribers only when the computed value actually changes", () => {
    const counter = createStore({ count: 0, other: 0 }, (set) => ({
      bumpOther: () => set((s) => ({ other: s.other + 1 })),
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const isEven = derive([counter], (s) => s.count % 2 === 0);
    const listener = vi.fn<(value: boolean) => void>();

    isEven.subscribe(listener);
    counter.get().bumpOther();

    expect(listener).not.toHaveBeenCalled();

    counter.get().increment(); // count: 1, isEven: false -> changed, notifies
    counter.get().increment(); // count: 2, isEven: true -> changed, notifies

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, false);
    expect(listener).toHaveBeenNthCalledWith(2, true);
  });

  it("stops notifying after unsubscribe", () => {
    const counter = createStore({ count: 0 }, (set) => ({
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));
    const double = derive([counter], (s) => s.count * 2);
    const listener = vi.fn<(value: number) => void>();

    const unsubscribe = double.subscribe(listener);
    unsubscribe();
    counter.get().increment();

    expect(listener).not.toHaveBeenCalled();
  });
});
