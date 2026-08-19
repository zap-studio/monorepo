import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useWakeLock } from "./use-wake-lock.ts";

function createSentinelMock() {
  const sentinel: WakeLockSentinel = new EventTarget();
  let released = false;

  Object.defineProperty(sentinel, "released", { configurable: true, get: () => released });
  Object.defineProperty(sentinel, "release", {
    configurable: true,
    value: vi.fn(async () => {
      released = true;
      sentinel.dispatchEvent(new Event("release"));
    }),
  });

  return sentinel;
}

function setNavigatorWakeLock(
  request: ((type: "screen") => Promise<WakeLockSentinel>) | undefined,
) {
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: request ? { request } : undefined,
  });
}

function setDocumentHidden(hidden: boolean) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => (hidden ? "hidden" : "visible"),
  });
}

describe(useWakeLock, () => {
  it("reports supported: true when navigator.wakeLock exists", () => {
    setNavigatorWakeLock(() => Promise.resolve(createSentinelMock()));

    const { result } = renderHook(() => useWakeLock());

    expect(result.current.supported).toBe(true);
    expect(result.current.active).toBe(false);
  });

  it("reports supported: false when navigator.wakeLock is unavailable", () => {
    setNavigatorWakeLock(undefined);

    const { result } = renderHook(() => useWakeLock());

    expect(result.current.supported).toBe(false);
  });

  it("becomes active after request() acquires a sentinel", async () => {
    const sentinel = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.active).toBe(true);
  });

  it("becomes inactive after release()", async () => {
    const sentinel = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.active).toBe(false);
    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });

  it("becomes inactive when the sentinel's own release event fires", async () => {
    const sentinel = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      sentinel.dispatchEvent(new Event("release"));
    });

    expect(result.current.active).toBe(false);
  });

  it("releases proactively when the document becomes hidden", async () => {
    setDocumentHidden(false);
    const sentinel = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      setDocumentHidden(true);
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.active).toBe(false);
    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });

  it("releases the active lock on unmount", async () => {
    const sentinel = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result, unmount } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    unmount();

    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });

  it("no-ops request()/release() when unsupported", async () => {
    setNavigatorWakeLock(undefined);

    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
      await result.current.release();
    });

    expect(result.current.active).toBe(false);
  });
});
