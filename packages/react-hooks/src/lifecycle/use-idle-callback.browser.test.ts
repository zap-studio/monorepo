import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
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
  it("schedules via requestIdleCallback when supported", async () => {
    const mock = setIdleCallbackSupport(true);
    await renderHook(() => useIdleCallback(vi.fn()));

    expect(mock?.requestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it("calls the callback with the idle deadline", async () => {
    const mock = setIdleCallbackSupport(true);
    const callback = vi.fn<(deadline: IdleDeadline) => void>();
    await renderHook(() => useIdleCallback(callback));

    const deadline = asTestDouble<IdleDeadline>({ didTimeout: false, timeRemaining: () => 42 });
    await act(() => {
      mock?.fire(deadline);
    });

    expect(callback).toHaveBeenCalledWith(deadline);
  });

  it("falls back to setTimeout when requestIdleCallback is unsupported", async () => {
    setIdleCallbackSupport(false);
    const callback = vi.fn<(deadline: IdleDeadline) => void>();
    await renderHook(() => useIdleCallback(callback));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    const [deadline] = callback.mock.calls[0] ?? [];
    expect(deadline?.didTimeout).toBe(false);
    expect(deadline?.timeRemaining()).toBeGreaterThan(0);
  });

  it("does not schedule when enabled: false", async () => {
    const mock = setIdleCallbackSupport(true);
    await renderHook(() => useIdleCallback(vi.fn(), undefined, false));

    expect(mock?.requestIdleCallback).not.toHaveBeenCalled();
  });

  it("cancels the pending callback on unmount", async () => {
    setIdleCallbackSupport(true);
    const { unmount } = await renderHook(() => useIdleCallback(vi.fn()));

    await unmount();

    expect(window.cancelIdleCallback).toHaveBeenCalledTimes(1);
  });
});

describe("useIdleCallback option stability", () => {
  it("does not re-request for an options object re-created every render", async () => {
    const idle = setIdleCallbackSupport(true);
    const { rerender } = await renderHook(() => useIdleCallback(() => {}, { timeout: 500 }));

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(1);

    await rerender();
    await rerender();

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it("re-requests when the timeout actually changes", async () => {
    const idle = setIdleCallbackSupport(true);
    const { rerender } = await renderHook(
      ({ timeout }: { timeout: number }) => useIdleCallback(() => {}, { timeout }),
      { initialProps: { timeout: 500 } },
    );

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(1);

    await rerender({ timeout: 1000 });

    expect(idle?.requestIdleCallback).toHaveBeenCalledTimes(2);
  });
});
