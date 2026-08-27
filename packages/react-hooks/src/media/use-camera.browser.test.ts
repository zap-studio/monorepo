import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCamera } from "./use-camera.ts";

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

describe("useCamera", () => {
  it("defaults to video-only when no options are given", async () => {
    const getUserMedia = vi.fn(() => Promise.resolve(makeStream()));
    setGetUserMedia(getUserMedia);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: false, video: true });
  });

  it("passes audio: true through when requested", async () => {
    const getUserMedia = vi.fn(() => Promise.resolve(makeStream()));
    setGetUserMedia(getUserMedia);

    const { result } = renderHook(() => useCamera({ audio: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
  });

  it("passes custom video constraints through", async () => {
    const getUserMedia = vi.fn(() => Promise.resolve(makeStream()));
    setGetUserMedia(getUserMedia);
    const videoConstraints = { facingMode: "user" };

    const { result } = renderHook(() => useCamera({ video: videoConstraints }));

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: false, video: videoConstraints });
  });
});
