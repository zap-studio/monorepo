import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useCounter } from "./use-counter.ts";

describe("useCounter", () => {
  it("defaults to 0", async () => {
    const { result } = await renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it("starts at the given initial value", async () => {
    const { result } = await renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  it("increment() adds 1 by default", async () => {
    const { result } = await renderHook(() => useCounter(0));

    await act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("increment(step) adds the given step", async () => {
    const { result } = await renderHook(() => useCounter(0));

    await act(() => {
      result.current.increment(5);
    });

    expect(result.current.count).toBe(5);
  });

  it("decrement() subtracts 1 by default", async () => {
    const { result } = await renderHook(() => useCounter(10));

    await act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(9);
  });

  it("decrement(step) subtracts the given step", async () => {
    const { result } = await renderHook(() => useCounter(10));

    await act(() => {
      result.current.decrement(4);
    });

    expect(result.current.count).toBe(6);
  });

  it("set() assigns an explicit value", async () => {
    const { result } = await renderHook(() => useCounter(0));

    await act(() => {
      result.current.set(42);
    });

    expect(result.current.count).toBe(42);
  });

  it("reset() restores the initial value", async () => {
    const { result } = await renderHook(() => useCounter(5));

    await act(() => {
      result.current.set(100);
    });
    await act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });

  it("clamps increment() at max", async () => {
    const { result } = await renderHook(() => useCounter(8, { max: 10 }));

    await act(() => {
      result.current.increment(5);
    });

    expect(result.current.count).toBe(10);
  });

  it("clamps decrement() at min", async () => {
    const { result } = await renderHook(() => useCounter(2, { min: 0 }));

    await act(() => {
      result.current.decrement(5);
    });

    expect(result.current.count).toBe(0);
  });

  it("clamps set() within min/max", async () => {
    const { result } = await renderHook(() => useCounter(5, { max: 10, min: 0 }));

    await act(() => {
      result.current.set(999);
    });
    expect(result.current.count).toBe(10);

    await act(() => {
      result.current.set(-999);
    });
    expect(result.current.count).toBe(0);
  });

  it("clamps the initial value too", async () => {
    const { result } = await renderHook(() => useCounter(999, { max: 10 }));

    expect(result.current.count).toBe(10);
  });
});
