import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThrottledValue } from "./use-throttled-value.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe(useThrottledValue, () => {
  it("starts equal to the initial value", () => {
    const { result } = renderHook(() => useThrottledValue("a", 500));

    expect(result.current).toBe("a");
  });

  it("updates immediately on the first change (leading edge)", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });

    expect(result.current).toBe("b");
  });

  it("does not update again within the cooldown window", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    rerender({ value: "c" });

    expect(result.current).toBe("b");
  });

  it("applies the latest value once the cooldown elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("c");
  });

  it("updates immediately again once a fresh cooldown window starts", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    rerender({ value: "c" });

    expect(result.current).toBe("c");
  });

  it("clears the pending timer on unmount", () => {
    const { rerender, unmount } = renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    rerender({ value: "c" });
    unmount();

    expect(() => vi.advanceTimersByTime(500)).not.toThrow();
  });
});
