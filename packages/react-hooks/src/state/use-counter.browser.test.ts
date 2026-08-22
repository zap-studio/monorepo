import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCounter } from "./use-counter.ts";

describe(useCounter, () => {
  it("defaults to 0", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it("starts at the given initial value", () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  it("increment() adds 1 by default", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("increment(step) adds the given step", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment(5);
    });

    expect(result.current.count).toBe(5);
  });

  it("decrement() subtracts 1 by default", () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(9);
  });

  it("decrement(step) subtracts the given step", () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.decrement(4);
    });

    expect(result.current.count).toBe(6);
  });

  it("set() assigns an explicit value", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.set(42);
    });

    expect(result.current.count).toBe(42);
  });

  it("reset() restores the initial value", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.set(100);
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });

  it("clamps increment() at max", () => {
    const { result } = renderHook(() => useCounter(8, { max: 10 }));

    act(() => {
      result.current.increment(5);
    });

    expect(result.current.count).toBe(10);
  });

  it("clamps decrement() at min", () => {
    const { result } = renderHook(() => useCounter(2, { min: 0 }));

    act(() => {
      result.current.decrement(5);
    });

    expect(result.current.count).toBe(0);
  });

  it("clamps set() within min/max", () => {
    const { result } = renderHook(() => useCounter(5, { max: 10, min: 0 }));

    act(() => {
      result.current.set(999);
    });
    expect(result.current.count).toBe(10);

    act(() => {
      result.current.set(-999);
    });
    expect(result.current.count).toBe(0);
  });

  it("clamps the initial value too", () => {
    const { result } = renderHook(() => useCounter(999, { max: 10 }));

    expect(result.current.count).toBe(10);
  });
});
