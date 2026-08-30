import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useScreenCapture } from "./use-screen-capture.ts";

interface StreamFixture {
  stop: ReturnType<typeof vi.fn<() => void>>;
  stream: MediaStream;
}

const makeStream = (): StreamFixture => {
  const stop = vi.fn<() => void>();
  const track = asTestDouble<MediaStreamTrack & EventTarget>(new EventTarget());
  Object.assign(track, { stop });
  const stream = asTestDouble<MediaStream & EventTarget>(new EventTarget());
  Object.assign(stream, {
    getTracks: () => [track],
    getVideoTracks: () => [track],
  });
  return { stop, stream };
};

const setGetDisplayMedia = (
  fn: ((options?: DisplayMediaStreamOptions) => Promise<MediaStream>) | undefined,
) => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: fn ? { getDisplayMedia: fn } : undefined,
  });
};

afterEach(() => {
  setGetDisplayMedia(undefined);
});

describe("useScreenCapture", () => {
  it('starts "idle" with no stream', () => {
    setGetDisplayMedia(() => Promise.resolve(makeStream().stream));

    const { result } = renderHook(() => useScreenCapture());

    expect(result.current.status).toBe("idle");
    expect(result.current.stream).toBeUndefined();
  });

  it('start() resolves the stream and becomes "active"', async () => {
    const { stream } = makeStream();
    const getDisplayMedia = vi.fn<() => Promise<MediaStream>>(() => Promise.resolve(stream));
    setGetDisplayMedia(getDisplayMedia);

    const { result } = renderHook(() => useScreenCapture({ video: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(getDisplayMedia).toHaveBeenCalledWith({ video: true });
    expect(result.current.status).toBe("active");
    expect(result.current.stream).toBe(stream);
  });

  it('becomes "error" when getDisplayMedia() rejects', async () => {
    setGetDisplayMedia(() => Promise.reject(new Error("Permission denied")));

    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Permission denied");
  });

  it("wraps a non-Error rejection", async () => {
    setGetDisplayMedia(() => Promise.reject("denied"));

    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error?.message).toBe("denied");
  });

  it('becomes "error" when unsupported', async () => {
    setGetDisplayMedia(undefined);

    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("error");
  });

  it("stop() stops every track and resets to idle", async () => {
    const { stop, stream } = makeStream();
    setGetDisplayMedia(() => Promise.resolve(stream));

    const { result } = renderHook(() => useScreenCapture());
    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(stop).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("idle");
  });

  it('auto-stops when the stream becomes inactive (browser "Stop sharing" bar)', async () => {
    const { stream } = makeStream();
    setGetDisplayMedia(() => Promise.resolve(stream));

    const { result } = renderHook(() => useScreenCapture());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status).toBe("active");

    await act(async () => {
      stream.dispatchEvent(new Event("inactive"));
    });

    expect(result.current.status).toBe("idle");
  });

  it("stops the stream on unmount", async () => {
    const { stop, stream } = makeStream();
    setGetDisplayMedia(() => Promise.resolve(stream));

    const { result, unmount } = renderHook(() => useScreenCapture());
    await act(async () => {
      await result.current.start();
    });

    unmount();

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("stops a stream that resolves after unmount instead of keeping it running", async () => {
    const { stop, stream } = makeStream();
    let resolveGetDisplayMedia: (value: MediaStream) => void = (_value: MediaStream) => undefined;
    setGetDisplayMedia(
      () =>
        new Promise((resolve) => {
          resolveGetDisplayMedia = resolve;
        }),
    );

    const { result, unmount } = renderHook(() => useScreenCapture());
    const started = act(async () => {
      await result.current.start();
    });

    unmount();
    resolveGetDisplayMedia(stream);
    await started;

    expect(stop).toHaveBeenCalledTimes(1);
  });
});

describe("useScreenCapture option stability", () => {
  it("keeps start stable across renders with an inline options object", () => {
    const { rerender, result } = renderHook(() => useScreenCapture({ video: true }));
    const first = result.current.start;

    rerender();

    expect(result.current.start).toBe(first);
  });
});
