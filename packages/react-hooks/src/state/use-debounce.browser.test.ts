import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useDebounce } from "./use-debounce.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebounce", () => {
  it("does not call the callback immediately", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = await renderHook(() => useDebounce(callback, 500));

    await act(() => {
      result.current("a");
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback once the delay elapses", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = await renderHook(() => useDebounce(callback, 500));

    await act(() => {
      result.current("a");
    });
    await act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("resets the timer on each call, only firing once with the last args", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = await renderHook(() => useDebounce(callback, 500));

    await act(() => {
      result.current("a");
      vi.advanceTimersByTime(300);
      result.current("b");
      vi.advanceTimersByTime(300);
      result.current("c");
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("c");
  });

  it("always calls the latest callback reference", async () => {
    const firstCallback = vi.fn<(value: string) => void>();
    const secondCallback = vi.fn<(value: string) => void>();
    const { result, rerender } = await renderHook(({ callback }) => useDebounce(callback, 500), {
      initialProps: { callback: firstCallback },
    });

    await act(() => {
      result.current("a");
    });
    await rerender({ callback: secondCallback });
    await act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("does not throw on unmount when no call was ever made", async () => {
    const { unmount } = await renderHook(() => useDebounce(vi.fn(), 500));

    expect(async () => await unmount()).not.toThrow();
  });

  it("clears the pending timer on unmount", async () => {
    const callback = vi.fn<(value: string) => void>();
    const { result, unmount } = await renderHook(() => useDebounce(callback, 500));

    await act(() => {
      result.current("a");
    });
    await unmount();
    await act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
