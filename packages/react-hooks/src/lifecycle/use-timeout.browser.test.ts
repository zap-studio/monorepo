import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useTimeout } from "./use-timeout.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTimeout", () => {
  it("calls the callback after the delay elapses", async () => {
    const callback = vi.fn<() => void>();
    await renderHook(() => useTimeout(callback, 1000));

    await act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(callback).not.toHaveBeenCalled();

    await act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not schedule when delayMs is null", async () => {
    const callback = vi.fn<() => void>();
    await renderHook(() => useTimeout(callback, null));

    await act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("clears the previous timer and reschedules when delayMs changes", async () => {
    const callback = vi.fn<() => void>();
    const { rerender } = await renderHook(({ delay }) => useTimeout(callback, delay), {
      initialProps: { delay: 1000 },
    });

    await act(() => {
      vi.advanceTimersByTime(500);
    });
    await rerender({ delay: 2000 });
    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();

    await act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("always calls the latest callback without resetting the timer", async () => {
    const firstCallback = vi.fn<() => void>();
    const secondCallback = vi.fn<() => void>();
    const { rerender } = await renderHook(({ callback }) => useTimeout(callback, 1000), {
      initialProps: { callback: firstCallback },
    });

    await rerender({ callback: secondCallback });
    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("clears the timer on unmount", async () => {
    const callback = vi.fn<() => void>();
    const { unmount } = await renderHook(() => useTimeout(callback, 1000));

    await unmount();
    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
