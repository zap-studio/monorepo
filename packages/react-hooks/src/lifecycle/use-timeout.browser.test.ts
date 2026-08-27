import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTimeout } from "./use-timeout.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTimeout", () => {
  it("calls the callback after the delay elapses", () => {
    const callback = vi.fn<() => void>();
    renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not schedule when delayMs is null", () => {
    const callback = vi.fn<() => void>();
    renderHook(() => useTimeout(callback, null));

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("clears the previous timer and reschedules when delayMs changes", () => {
    const callback = vi.fn<() => void>();
    const { rerender } = renderHook(({ delay }) => useTimeout(callback, delay), {
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

  it("always calls the latest callback without resetting the timer", () => {
    const firstCallback = vi.fn<() => void>();
    const secondCallback = vi.fn<() => void>();
    const { rerender } = renderHook(({ callback }) => useTimeout(callback, 1000), {
      initialProps: { callback: firstCallback },
    });

    rerender({ callback: secondCallback });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("clears the timer on unmount", () => {
    const callback = vi.fn<() => void>();
    const { unmount } = renderHook(() => useTimeout(callback, 1000));

    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
