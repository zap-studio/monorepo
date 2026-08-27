import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useWakeLock } from "./use-wake-lock.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

const createSentinelMock = () => {
  // SAFETY: the hook only calls sentinel.release(), sentinel.addEventListener("release", ...)
  // (inherited from EventTarget), and reads `released` (unused by the hook itself but part of
  // the real WakeLockSentinel shape) — all defined right below.
  const sentinel = asTestDouble<WakeLockSentinel>(new EventTarget());
  let released = false;

  Object.defineProperty(sentinel, "released", { configurable: true, get: () => released });
  Object.defineProperty(sentinel, "release", {
    configurable: true,
    value: vi.fn<() => Promise<void>>(async () => {
      released = true;
      sentinel.dispatchEvent(new Event("release"));
    }),
  });

  return sentinel;
};

const setNavigatorWakeLock = (
  request: ((type: "screen") => Promise<WakeLockSentinel>) | undefined,
) => {
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: request ? { request } : undefined,
  });
};

const setDocumentHidden = (hidden: boolean) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => (hidden ? "hidden" : "visible"),
  });
};

describe("useWakeLock", () => {
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

  it("does not release when visibilitychange fires while still visible", async () => {
    setDocumentHidden(false);
    const sentinel = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.active).toBe(true);
    expect(sentinel.release).not.toHaveBeenCalled();
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
