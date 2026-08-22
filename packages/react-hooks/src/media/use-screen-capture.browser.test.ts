import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScreenCapture } from "./use-screen-capture.ts";

function makeStream() {
  const track = new EventTarget() as MediaStreamTrack & EventTarget;
  Object.assign(track, { stop: vi.fn() });
  return {
    getTracks: () => [track],
    getVideoTracks: () => [track],
    track,
  } as unknown as MediaStream & { track: MediaStreamTrack & EventTarget };
}

function setGetDisplayMedia(
  fn: ((options?: DisplayMediaStreamOptions) => Promise<MediaStream>) | undefined,
) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: fn ? { getDisplayMedia: fn } : undefined,
  });
}

afterEach(() => {
  setGetDisplayMedia(undefined);
});

describe(useScreenCapture, () => {
  it('starts "idle" with no stream', () => {
    setGetDisplayMedia(() => Promise.resolve(makeStream()));

    const { result } = renderHook(() => useScreenCapture());

    expect(result.current.status).toBe("idle");
    expect(result.current.stream).toBeUndefined();
  });

  it('start() resolves the stream and becomes "active"', async () => {
    const stream = makeStream();
    const getDisplayMedia = vi.fn(() => Promise.resolve(stream));
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
    const stream = makeStream();
    setGetDisplayMedia(() => Promise.resolve(stream));

    const { result } = renderHook(() => useScreenCapture());
    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("idle");
  });

  it('auto-stops when the video track ends (browser "Stop sharing" bar)', async () => {
    const stream = makeStream();
    setGetDisplayMedia(() => Promise.resolve(stream));

    const { result } = renderHook(() => useScreenCapture());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status).toBe("active");

    await act(async () => {
      stream.track.dispatchEvent(new Event("ended"));
    });

    expect(result.current.status).toBe("idle");
  });

  it("stops the stream on unmount", async () => {
    const stream = makeStream();
    setGetDisplayMedia(() => Promise.resolve(stream));

    const { result, unmount } = renderHook(() => useScreenCapture());
    await act(async () => {
      await result.current.start();
    });

    unmount();

    expect(stream.track.stop).toHaveBeenCalledTimes(1);
  });
});
