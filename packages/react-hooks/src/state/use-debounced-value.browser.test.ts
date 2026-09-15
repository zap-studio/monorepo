import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useDebouncedValue } from "./use-debounced-value.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("starts equal to the initial value", async () => {
    const { result } = await renderHook(() => useDebouncedValue("a", 500));

    expect(result.current).toBe("a");
  });

  it("does not update immediately when the value changes", async () => {
    const { result, rerender } = await renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });

    expect(result.current).toBe("a");
  });

  it("updates once the delay elapses", async () => {
    const { result, rerender } = await renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    await act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("b");
  });

  it("only reflects the last value when it changes rapidly", async () => {
    const { result, rerender } = await renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    await act(() => {
      vi.advanceTimersByTime(200);
    });
    await rerender({ value: "c" });
    await act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("c");
  });

  it("clears the pending timer on unmount", async () => {
    const { rerender, unmount } = await renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    await unmount();

    expect(() => vi.advanceTimersByTime(500)).not.toThrow();
  });
});
