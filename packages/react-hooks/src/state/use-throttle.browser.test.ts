import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useThrottle } from "./use-throttle.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useThrottle", () => {
  it("calls the callback immediately on the first call (leading edge)", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = await renderHook(() => useThrottle(callback, 500));

    await act(() => {
      result.current("a");
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("drops calls made during the cooldown window", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = await renderHook(() => useThrottle(callback, 500));

    await act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("allows a new call once the cooldown elapses", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = await renderHook(() => useThrottle(callback, 500));

    await act(() => {
      result.current("a");
      vi.advanceTimersByTime(500);
      result.current("b");
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "a");
    expect(callback).toHaveBeenNthCalledWith(2, "b");
  });

  it("always calls the latest callback reference", async () => {
    const firstCallback = vi.fn<(value: string) => void>();
    const secondCallback = vi.fn<(value: string) => void>();
    const { result, rerender } = await renderHook(({ callback }) => useThrottle(callback, 500), {
      initialProps: { callback: firstCallback },
    });

    await rerender({ callback: secondCallback });
    await act(() => {
      result.current("a");
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("does not throw on unmount when no call was ever made", async () => {
    const { unmount } = await renderHook(() => useThrottle(vi.fn(), 500));

    expect(async () => await unmount()).not.toThrow();
  });

  it("clears the cooldown timer on unmount", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result, unmount } = await renderHook(() => useThrottle(callback, 500));

    await act(() => {
      result.current("a");
    });
    await unmount();

    expect(() => vi.advanceTimersByTime(500)).not.toThrow();
  });
});
