import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "./use-debounce.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebounce", () => {
  it("does not call the callback immediately", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = renderHook(() => useDebounce(callback, 500));

    act(() => {
      result.current("a");
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback once the delay elapses", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = renderHook(() => useDebounce(callback, 500));

    act(() => {
      result.current("a");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("resets the timer on each call, only firing once with the last args", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = renderHook(() => useDebounce(callback, 500));

    act(() => {
      result.current("a");
      vi.advanceTimersByTime(300);
      result.current("b");
      vi.advanceTimersByTime(300);
      result.current("c");
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledExactlyOnceWith("c");
  });

  it("always calls the latest callback reference", () => {
    const firstCallback = vi.fn<(value: string) => void>();
    const secondCallback = vi.fn<(value: string) => void>();
    const { result, rerender } = renderHook(({ callback }) => useDebounce(callback, 500), {
      initialProps: { callback: firstCallback },
    });

    act(() => {
      result.current("a");
    });
    rerender({ callback: secondCallback });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("does not throw on unmount when no call was ever made", () => {
    const { unmount } = renderHook(() => useDebounce(vi.fn(), 500));

    expect(() => unmount()).not.toThrow();
  });

  it("clears the pending timer on unmount", () => {
    const callback = vi.fn<(value: string) => void>();
    const { result, unmount } = renderHook(() => useDebounce(callback, 500));

    act(() => {
      result.current("a");
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
