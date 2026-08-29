import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useCamera } from "./use-camera.ts";

const makeStream = () => {
  // SAFETY: useMediaCapture's stop() and unmount cleanup only call `track.stop()` on each track, so a stub with just `stop` covers every MediaStreamTrack member the hook under test reads.
  const track = asTestDouble<MediaStreamTrack>({ stop: vi.fn<() => void>() });
  // SAFETY: useMediaCapture only calls `stream.getTracks()` on the resolved MediaStream, to stop it. `track` is there only so this test file can assert on it directly, so a stub with just those two members covers every MediaStream member the hook and the tests read.
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

describe("useCamera", () => {
  it("defaults to video-only when no options are given", async () => {
    const getUserMedia = vi.fn<() => Promise<MediaStream & { track: MediaStreamTrack }>>(() =>
      Promise.resolve(makeStream()),
    );
    setGetUserMedia(getUserMedia);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: false, video: true });
  });

  it("passes audio: true through when requested", async () => {
    const getUserMedia = vi.fn<() => Promise<MediaStream & { track: MediaStreamTrack }>>(() =>
      Promise.resolve(makeStream()),
    );
    setGetUserMedia(getUserMedia);

    const { result } = renderHook(() => useCamera({ audio: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
  });

  it("passes custom video constraints through", async () => {
    const getUserMedia = vi.fn<() => Promise<MediaStream & { track: MediaStreamTrack }>>(() =>
      Promise.resolve(makeStream()),
    );
    setGetUserMedia(getUserMedia);
    const videoConstraints = { facingMode: "user" };

    const { result } = renderHook(() => useCamera({ video: videoConstraints }));

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: false, video: videoConstraints });
  });
});
