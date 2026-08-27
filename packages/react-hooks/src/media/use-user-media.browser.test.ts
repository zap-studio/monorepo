import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUserMedia } from "./use-user-media.ts";

const makeStream = () => {
  const track = { stop: vi.fn() } as unknown as MediaStreamTrack;
  return { getTracks: () => [track], track } as unknown as MediaStream & {
    track: MediaStreamTrack;
  };
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
