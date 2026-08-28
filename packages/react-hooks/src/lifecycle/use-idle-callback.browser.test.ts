import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIdleCallback } from "./use-idle-callback.ts";

const setIdleCallbackSupport = (
  supported: boolean,
):
  | { fire: (deadline: IdleDeadline) => void; requestIdleCallback: ReturnType<typeof vi.fn> }
  | undefined => {
  if (!supported) {
    Reflect.deleteProperty(window, "requestIdleCallback");
    Reflect.deleteProperty(window, "cancelIdleCallback");
    return undefined;
  }

  let stored: IdleRequestCallback | undefined;
  const requestIdleCallback = vi.fn<(callback: IdleRequestCallback) => number>(
    (callback: IdleRequestCallback) => {
      stored = callback;
      return 1;
    },
  );
  Object.defineProperty(window, "requestIdleCallback", {
    configurable: true,
    value: requestIdleCallback,
  });
  Object.defineProperty(window, "cancelIdleCallback", {
    configurable: true,
    value: vi.fn<(handle: number) => void>(),
  });

  return {
    fire: (deadline: IdleDeadline) => stored?.(deadline),
    requestIdleCallback,
  };
};

afterEach(() => {
  Reflect.deleteProperty(window, "requestIdleCallback");
  Reflect.deleteProperty(window, "cancelIdleCallback");
});

describe("useIdleCallback", () => {
  it("schedules via requestIdleCallback when supported", () => {
    const mock = setIdleCallbackSupport(true);
    renderHook(() => useIdleCallback(vi.fn()));

    expect(mock?.requestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it("calls the callback with the idle deadline", () => {
    const mock = setIdleCallbackSupport(true);
    const callback = vi.fn<(deadline: IdleDeadline) => void>();
    renderHook(() => useIdleCallback(callback));

    // SAFETY: the hook passes this object from `fire` to `callback` without changing it, and
    // never reads any other IdleDeadline members. So didTimeout/timeRemaining are enough.
    const deadline = { didTimeout: false, timeRemaining: () => 42 } as IdleDeadline;
    act(() => {
      mock?.fire(deadline);
    });

    expect(callback).toHaveBeenCalledWith(deadline);
  });

  it("falls back to setTimeout when requestIdleCallback is unsupported", async () => {
    setIdleCallbackSupport(false);
    const callback = vi.fn<(deadline: IdleDeadline) => void>();
    renderHook(() => useIdleCallback(callback));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    // SAFETY: the toHaveBeenCalledTimes check above proves calls[0] exists. The setTimeout
    // fallback in use-idle-callback.ts always calls it with a
    // { didTimeout, timeRemaining } deadline object.
    const [deadline] = callback.mock.calls[0] as [IdleDeadline];
    expect(deadline.didTimeout).toBe(false);
    expect(deadline.timeRemaining()).toBeGreaterThan(0);
  });

  it("does not schedule when enabled: false", () => {
    const mock = setIdleCallbackSupport(true);
    renderHook(() => useIdleCallback(vi.fn(), undefined, false));

    expect(mock?.requestIdleCallback).not.toHaveBeenCalled();
  });

  it("cancels the pending callback on unmount", () => {
    setIdleCallbackSupport(true);
    const { unmount } = renderHook(() => useIdleCallback(vi.fn()));

    unmount();

    expect(window.cancelIdleCallback).toHaveBeenCalledTimes(1);
  });
});

describe("useIdleCallback option stability", () => {
  it("does not re-request for an options object re-created every render", () => {
    const idle = setIdleCallbackSupport(true);
    const { rerender } = renderHook(() => useIdleCallback(() => {}, { timeout: 500 }));

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(1);

    rerender();
    rerender();

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it("re-requests when the timeout actually changes", () => {
    const idle = setIdleCallbackSupport(true);
    const { rerender } = renderHook(
      ({ timeout }: { timeout: number }) => useIdleCallback(() => {}, { timeout }),
      { initialProps: { timeout: 500 } },
    );

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(1);

    rerender({ timeout: 1000 });

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(2);
  });
});
