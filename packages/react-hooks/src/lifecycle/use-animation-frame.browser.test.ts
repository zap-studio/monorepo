import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAnimationFrame } from "./use-animation-frame.ts";

let rafCallbacks = new Map<number, FrameRequestCallback>();
let nextHandle = 0;

const installMockRaf = () => {
  rafCallbacks = new Map();
  nextHandle = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    nextHandle += 1;
    rafCallbacks.set(nextHandle, callback);
    return nextHandle;
  });
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => {
    rafCallbacks.delete(handle);
  });
};

const flushFrame = (time: number) => {
  const pending = [...rafCallbacks.values()];
  rafCallbacks.clear();
  for (const callback of pending) {
    callback(time);
  }
};

beforeEach(() => {
  installMockRaf();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useAnimationFrame, () => {
  it("schedules a frame on mount", () => {
    renderHook(() => useAnimationFrame(vi.fn()));

    expect(rafCallbacks.size).toBe(1);
  });

  it("does not call the callback on the very first frame (no delta yet)", () => {
    const callback = vi.fn();
    renderHook(() => useAnimationFrame(callback));

    act(() => {
      flushFrame(16);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback with the delta time on subsequent frames", () => {
    const callback = vi.fn();
    renderHook(() => useAnimationFrame(callback));

    act(() => {
      flushFrame(16);
    });
    act(() => {
      flushFrame(32);
    });

    expect(callback).toHaveBeenCalledWith(16);
  });

  it("does not schedule when enabled: false", () => {
    renderHook(() => useAnimationFrame(vi.fn(), false));

    expect(rafCallbacks.size).toBe(0);
  });

  it("always calls the latest callback", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const { rerender } = renderHook(({ callback }) => useAnimationFrame(callback), {
      initialProps: { callback: firstCallback },
    });

    act(() => {
      flushFrame(16);
    });
    rerender({ callback: secondCallback });
    act(() => {
      flushFrame(32);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("cancels the pending frame on unmount", () => {
    const { unmount } = renderHook(() => useAnimationFrame(vi.fn()));

    unmount();

    expect(rafCallbacks.size).toBe(0);
  });
});
