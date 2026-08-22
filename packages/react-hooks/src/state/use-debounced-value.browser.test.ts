import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "./use-debounced-value.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe(useDebouncedValue, () => {
  it("starts equal to the initial value", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 500));

    expect(result.current).toBe("a");
  });

  it("does not update immediately when the value changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });

    expect(result.current).toBe("a");
  });

  it("updates once the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("b");
  });

  it("only reflects the last value when it changes rapidly", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("c");
  });

  it("clears the pending timer on unmount", () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    unmount();

    expect(() => vi.advanceTimersByTime(500)).not.toThrow();
  });
});
