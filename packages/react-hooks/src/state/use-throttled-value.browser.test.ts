import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useThrottledValue } from "./use-throttled-value.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useThrottledValue", () => {
  it("starts equal to the initial value", async () => {
    const { result } = await renderHook(() => useThrottledValue("a", 500));

    expect(result.current).toBe("a");
  });

  it("updates immediately on the first change (leading edge)", async () => {
    const { result, rerender } = await renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });

    expect(result.current).toBe("b");
  });

  it("does not update again within the cooldown window", async () => {
    const { result, rerender } = await renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    await rerender({ value: "c" });

    expect(result.current).toBe("b");
  });

  it("applies the latest value once the cooldown elapses", async () => {
    const { result, rerender } = await renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    await rerender({ value: "c" });
    await act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("c");
  });

  it("updates immediately again once a fresh cooldown window starts", async () => {
    const { result, rerender } = await renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    await act(() => {
      vi.advanceTimersByTime(500);
    });
    await rerender({ value: "c" });

    expect(result.current).toBe("c");
  });

  it("clears the pending timer on unmount", async () => {
    const { rerender, unmount } = await renderHook(({ value }) => useThrottledValue(value, 500), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    await rerender({ value: "c" });
    await unmount();

    expect(() => vi.advanceTimersByTime(500)).not.toThrow();
  });
});
