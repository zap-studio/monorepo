import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
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

describe("useAnimationFrame", () => {
  it("schedules a frame on mount", async () => {
    await renderHook(() => useAnimationFrame(vi.fn()));

    expect(rafCallbacks.size).toBe(1);
  });

  it("does not call the callback on the very first frame (no delta yet)", async () => {
    const callback = vi.fn<(deltaMs: number) => void>();
    await renderHook(() => useAnimationFrame(callback));

    await act(() => {
      flushFrame(16);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback with the delta time on subsequent frames", async () => {
    const callback = vi.fn<(deltaMs: number) => void>();
    await renderHook(() => useAnimationFrame(callback));

    await act(() => {
      flushFrame(16);
    });
    await act(() => {
      flushFrame(32);
    });

    expect(callback).toHaveBeenCalledWith(16);
  });

  it("does not schedule when enabled: false", async () => {
    await renderHook(() => useAnimationFrame(vi.fn(), false));

    expect(rafCallbacks.size).toBe(0);
  });

  it("always calls the latest callback", async () => {
    const firstCallback = vi.fn<(deltaMs: number) => void>();
    const secondCallback = vi.fn<(deltaMs: number) => void>();
    const { rerender } = await renderHook(({ callback }) => useAnimationFrame(callback), {
      initialProps: { callback: firstCallback },
    });

    await act(() => {
      flushFrame(16);
    });
    await rerender({ callback: secondCallback });
    await act(() => {
      flushFrame(32);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("cancels the pending frame on unmount", async () => {
    const { unmount } = await renderHook(() => useAnimationFrame(vi.fn()));

    await unmount();

    expect(rafCallbacks.size).toBe(0);
  });
});
