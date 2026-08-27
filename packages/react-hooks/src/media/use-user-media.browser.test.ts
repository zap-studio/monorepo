import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUserMedia } from "./use-user-media.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

const makeStream = () => {
  // SAFETY: useMediaCapture's stop()/unmount cleanup only ever calls `track.stop()` on each track, so a stub exposing just `stop` covers every MediaStreamTrack member the hook under test reads.
  const track = asTestDouble<MediaStreamTrack>({ stop: vi.fn<() => void>() });
  // SAFETY: useMediaCapture only calls `stream.getTracks()` on the resolved MediaStream (to stop it); `track` is exposed solely so this test file can assert on it directly, so a stub with just those two members covers every MediaStream member the hook and the tests read.
  return asTestDouble<MediaStream & { track: MediaStreamTrack }>({
    getTracks: () => [track],
    track,
  });
};

const setGetUserMedia = (
  fn: ((constraints?: MediaStreamConstraints) => Promise<MediaStream>) | undefined,
) => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: fn ? { getUserMedia: fn } : undefined,
  });
};

afterEach(() => {
  setGetUserMedia(undefined);
});

describe("useUserMedia", () => {
  it('starts "idle" with no stream', () => {
    setGetUserMedia(() => Promise.resolve(makeStream()));

    const { result } = renderHook(() => useUserMedia({ video: true }));

    expect(result.current.status).toBe("idle");
    expect(result.current.stream).toBeUndefined();
  });

  it('start() resolves the stream and becomes "active"', async () => {
    const stream = makeStream();
    const getUserMedia = vi.fn<() => Promise<MediaStream & { track: MediaStreamTrack }>>(() =>
      Promise.resolve(stream),
    );
    setGetUserMedia(getUserMedia);

    const { result } = renderHook(() => useUserMedia({ video: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(result.current.status).toBe("active");
    expect(result.current.stream).toBe(stream);
  });

  it('becomes "error" when getUserMedia() rejects', async () => {
    setGetUserMedia(() => Promise.reject(new Error("Permission denied")));

    const { result } = renderHook(() => useUserMedia({ video: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Permission denied");
  });

  it("wraps a non-Error rejection", async () => {
    setGetUserMedia(() => Promise.reject("denied"));

    const { result } = renderHook(() => useUserMedia({ video: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("denied");
  });

  it('becomes "error" when unsupported', async () => {
    setGetUserMedia(undefined);

    const { result } = renderHook(() => useUserMedia({ video: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.stream).toBeUndefined();
  });

  it("stop() stops every track and resets to idle", async () => {
    const stream = makeStream();
    setGetUserMedia(() => Promise.resolve(stream));

    const { result } = renderHook(() => useUserMedia({ video: true }));
    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("idle");
    expect(result.current.stream).toBeUndefined();
  });

  it("stops the stream on unmount", async () => {
    const stream = makeStream();
    setGetUserMedia(() => Promise.resolve(stream));

    const { result, unmount } = renderHook(() => useUserMedia({ video: true }));
    await act(async () => {
      await result.current.start();
    });

    unmount();

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
  });

  it("stops a stream that resolves after unmount instead of keeping it running", async () => {
    const stream = makeStream();
    let resolveGetUserMedia: (value: MediaStream) => void = () => undefined;
    setGetUserMedia(
      () =>
        new Promise((resolve) => {
          resolveGetUserMedia = resolve;
        }),
    );

    const { result, unmount } = renderHook(() => useUserMedia({ video: true }));
    const started = act(async () => {
      await result.current.start();
    });

    unmount();
    resolveGetUserMedia(stream);
    await started;

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
  });
});

describe("useUserMedia constraint stability", () => {
  it("keeps start stable across renders with an inline constraints object", () => {
    const { rerender, result } = renderHook(() => useUserMedia({ audio: true, video: true }));
    const first = result.current.start;

    rerender();

    expect(result.current.start).toBe(first);
  });
});
