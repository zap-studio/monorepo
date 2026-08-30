import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThrottle } from "./use-throttle.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useThrottle", () => {
  it("calls the callback immediately on the first call (leading edge)", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current("a");
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("drops calls made during the cooldown window", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("allows a new call once the cooldown elapses", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current("a");
      vi.advanceTimersByTime(500);
      result.current("b");
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "a");
    expect(callback).toHaveBeenNthCalledWith(2, "b");
  });

  it("always calls the latest callback reference", () => {
    const firstCallback = vi.fn<(value: string) => void>();
    const secondCallback = vi.fn<(value: string) => void>();
    const { result, rerender } = renderHook(({ callback }) => useThrottle(callback, 500), {
      initialProps: { callback: firstCallback },
    });

    rerender({ callback: secondCallback });
    act(() => {
      result.current("a");
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("does not throw on unmount when no call was ever made", () => {
    const { unmount } = renderHook(() => useThrottle(vi.fn(), 500));

    expect(() => unmount()).not.toThrow();
  });

  it("clears the cooldown timer on unmount", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result, unmount } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current("a");
    });
    unmount();

    expect(() => vi.advanceTimersByTime(500)).not.toThrow();
  });
});
