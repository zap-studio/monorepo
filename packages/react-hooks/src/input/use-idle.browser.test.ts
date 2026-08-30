import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIdle } from "./use-idle.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useIdle", () => {
  it("starts as false", () => {
    const { result } = renderHook(() => useIdle(1000));

    expect(result.current).toBe(false);
  });

  it("becomes true after the timeout elapses with no activity", () => {
    const { result } = renderHook(() => useIdle(1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(true);
  });

  it("stays false if activity happens before the timeout", () => {
    const { result } = renderHook(() => useIdle(1000));

    act(() => {
      vi.advanceTimersByTime(500);
      window.dispatchEvent(new Event("mousemove"));
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(false);
  });

  it("becomes false again after activity following an idle period", () => {
    const { result } = renderHook(() => useIdle(1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("keydown"));
    });

    expect(result.current).toBe(false);
  });

  it("uses a default timeout when none is provided", () => {
    const { result } = renderHook(() => useIdle());

    act(() => {
      vi.advanceTimersByTime(59_999);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it("stops listening and clears its timer on unmount", () => {
    const { result, unmount } = renderHook(() => useIdle(1000));
    unmount();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(false);
  });
});
