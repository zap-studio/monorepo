import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useIdle } from "./use-idle.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useIdle", () => {
  it("starts as false", async () => {
    const { result } = await renderHook(() => useIdle(1000));

    expect(result.current).toBe(false);
  });

  it("becomes true after the timeout elapses with no activity", async () => {
    const { result } = await renderHook(() => useIdle(1000));

    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(true);
  });

  it("stays false if activity happens before the timeout", async () => {
    const { result } = await renderHook(() => useIdle(1000));

    await act(() => {
      vi.advanceTimersByTime(500);
      window.dispatchEvent(new Event("mousemove"));
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(false);
  });

  it("becomes false again after activity following an idle period", async () => {
    const { result } = await renderHook(() => useIdle(1000));

    await act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);

    await act(() => {
      window.dispatchEvent(new Event("keydown"));
    });

    expect(result.current).toBe(false);
  });

  it("uses a default timeout when none is provided", async () => {
    const { result } = await renderHook(() => useIdle());

    await act(() => {
      vi.advanceTimersByTime(59_999);
    });
    expect(result.current).toBe(false);

    await act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it("stops listening and clears its timer on unmount", async () => {
    const { result, unmount } = await renderHook(() => useIdle(1000));
    await unmount();

    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(false);
  });
});
