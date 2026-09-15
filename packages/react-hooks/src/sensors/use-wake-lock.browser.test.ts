import { describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { useWakeLock } from "./use-wake-lock.ts";

const createSentinelMock = () => {
  const sentinel = asTestDouble<WakeLockSentinel>(new EventTarget());
  let released = false;

  const release = vi.fn<() => Promise<void>>(async () => {
    released = true;
    sentinel.dispatchEvent(new Event("release"));
  });

  Object.defineProperty(sentinel, "released", { configurable: true, get: () => released });
  Object.defineProperty(sentinel, "release", {
    configurable: true,
    value: release,
  });

  return { release, sentinel };
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
  it("reports supported: true when navigator.wakeLock exists", async () => {
    const { sentinel } = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = await renderHook(() => useWakeLock());

    expect(result.current.supported).toBe(true);
    expect(result.current.active).toBe(false);
  });

  it("reports supported: false when navigator.wakeLock is unavailable", async () => {
    setNavigatorWakeLock(undefined);

    const { result } = await renderHook(() => useWakeLock());

    expect(result.current.supported).toBe(false);
  });

  it("becomes active after request() acquires a sentinel", async () => {
    const { sentinel } = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = await renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.active).toBe(true);
  });

  it("becomes inactive after release()", async () => {
    const { release, sentinel } = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = await renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.active).toBe(false);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("becomes inactive when the sentinel's own release event fires", async () => {
    const { sentinel } = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = await renderHook(() => useWakeLock());
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
    const { release, sentinel } = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = await renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      setDocumentHidden(true);
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.active).toBe(false);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("does not release when visibilitychange fires while still visible", async () => {
    setDocumentHidden(false);
    const { release, sentinel } = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result } = await renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.active).toBe(true);
    expect(release).not.toHaveBeenCalled();
  });

  it("releases the active lock on unmount", async () => {
    const { release, sentinel } = createSentinelMock();
    setNavigatorWakeLock(() => Promise.resolve(sentinel));

    const { result, unmount } = await renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    await unmount();

    expect(release).toHaveBeenCalledTimes(1);
  });

  it("no-ops request()/release() when unsupported", async () => {
    setNavigatorWakeLock(undefined);

    const { result } = await renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
      await result.current.release();
    });

    expect(result.current.active).toBe(false);
  });
});
