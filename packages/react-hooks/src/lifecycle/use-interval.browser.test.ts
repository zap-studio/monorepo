import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useInterval } from "./use-interval.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useInterval", () => {
  it("calls the callback every delay", async () => {
    const callback = vi.fn<() => void>();
    await renderHook(() => useInterval(callback, 1000));

    await act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("does not schedule when delayMs is null", async () => {
    const callback = vi.fn<() => void>();
    await renderHook(() => useInterval(callback, null));

    await act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("restarts the interval when delayMs changes", async () => {
    const callback = vi.fn<() => void>();
    const { rerender } = await renderHook(({ delay }) => useInterval(callback, delay), {
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

  it("always calls the latest callback without resetting the interval", async () => {
    const firstCallback = vi.fn<() => void>();
    const secondCallback = vi.fn<() => void>();
    const { rerender } = await renderHook(({ callback }) => useInterval(callback, 1000), {
      initialProps: { callback: firstCallback },
    });

    await rerender({ callback: secondCallback });
    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("clears the interval on unmount", async () => {
    const callback = vi.fn<() => void>();
    const { unmount } = await renderHook(() => useInterval(callback, 1000));

    await unmount();
    await act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
