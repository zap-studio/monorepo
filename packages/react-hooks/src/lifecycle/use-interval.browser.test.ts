import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useInterval } from "./use-interval.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useInterval", () => {
  it("calls the callback every delay", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("does not schedule when delayMs is null", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("restarts the interval when delayMs changes", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    rerender({ delay: 2000 });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("always calls the latest callback without resetting the interval", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const { rerender } = renderHook(({ callback }) => useInterval(callback, 1000), {
      initialProps: { callback: firstCallback },
    });

    rerender({ callback: secondCallback });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("clears the interval on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    unmount();
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
