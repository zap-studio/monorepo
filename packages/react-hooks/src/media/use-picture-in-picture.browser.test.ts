import { act, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { usePictureInPicture, type UsePictureInPictureResult } from "./use-picture-in-picture.ts";

const setPictureInPictureSupport = (supported: boolean) => {
  Object.defineProperty(document, "pictureInPictureEnabled", {
    configurable: true,
    value: supported,
  });
};

const setPictureInPictureElement = (element: Element | null) => {
  Object.defineProperty(document, "pictureInPictureElement", {
    configurable: true,
    value: element,
  });
};

const renderPipVideo = () => {
  let latest!: UsePictureInPictureResult<HTMLVideoElement>;
  const TestComponent = () => {
    latest = usePictureInPicture<HTMLVideoElement>();
    return createElement("video", { ref: latest.ref });
  };
  const { unmount } = render(createElement(TestComponent));
  return {
    get current() {
      return latest;
    },
    unmount,
  };
};

afterEach(() => {
  setPictureInPictureSupport(true);
  setPictureInPictureElement(null);
});

describe("usePictureInPicture", () => {
  it("reports supported: true when document.pictureInPictureEnabled is true", () => {
    setPictureInPictureSupport(true);

    const { result } = renderHook(() => usePictureInPicture());

    expect(result.current.supported).toBe(true);
    expect(result.current.active).toBe(false);
  });

  it("reports supported: false when document.pictureInPictureEnabled is false", () => {
    setPictureInPictureSupport(false);

    const { result } = renderHook(() => usePictureInPicture());

    expect(result.current.supported).toBe(false);
  });

  it("enter() requests PiP on the ref'd element", async () => {
    setPictureInPictureSupport(true);
    const requestPictureInPicture = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const element = asTestDouble<HTMLVideoElement>({ requestPictureInPicture });

    const { result } = renderHook(() => usePictureInPicture<HTMLVideoElement>());
    result.current.ref.current = element;

    await act(async () => {
      await result.current.enter();
    });

    expect(requestPictureInPicture).toHaveBeenCalledTimes(1);
  });

  it("enter() no-ops when no element is attached to the ref", async () => {
    setPictureInPictureSupport(true);

    const { result } = renderHook(() => usePictureInPicture());

    await expect(result.current.enter()).resolves.toBeUndefined();
  });

  it("becomes active when the video element fires enterpictureinpicture", async () => {
    setPictureInPictureSupport(true);
    const video = renderPipVideo();

    await act(async () => {
      video.current.ref.current?.dispatchEvent(new Event("enterpictureinpicture"));
    });

    expect(video.current.active).toBe(true);
  });

  it("becomes inactive when the video element fires leavepictureinpicture", async () => {
    setPictureInPictureSupport(true);
    const video = renderPipVideo();

    await act(async () => {
      video.current.ref.current?.dispatchEvent(new Event("enterpictureinpicture"));
    });
    expect(video.current.active).toBe(true);

    await act(async () => {
      video.current.ref.current?.dispatchEvent(new Event("leavepictureinpicture"));
    });

    expect(video.current.active).toBe(false);
  });

  it("exit() calls document.exitPictureInPicture() when this element is active", async () => {
    setPictureInPictureSupport(true);
    const element = document.createElement("video");
    const exitPictureInPicture = vi.fn<() => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(document, "exitPictureInPicture", {
      configurable: true,
      value: exitPictureInPicture,
    });

    const { result } = renderHook(() => usePictureInPicture<HTMLVideoElement>());
    result.current.ref.current = element;
    setPictureInPictureElement(element);

    await act(async () => {
      await result.current.exit();
    });

    expect(exitPictureInPicture).toHaveBeenCalledTimes(1);
  });

  it("exit() no-ops when a different element is the active PiP element", async () => {
    setPictureInPictureSupport(true);
    const element = document.createElement("video");
    const other = document.createElement("video");
    const exitPictureInPicture = vi.fn<() => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(document, "exitPictureInPicture", {
      configurable: true,
      value: exitPictureInPicture,
    });

    const { result } = renderHook(() => usePictureInPicture<HTMLVideoElement>());
    result.current.ref.current = element;
    setPictureInPictureElement(other);

    await act(async () => {
      await result.current.exit();
    });

    expect(exitPictureInPicture).not.toHaveBeenCalled();
  });

  it("enter()/exit() no-op when unsupported", async () => {
    setPictureInPictureSupport(false);
    const element = document.createElement("video");

    const { result } = renderHook(() => usePictureInPicture<HTMLVideoElement>());
    result.current.ref.current = element;

    await act(async () => {
      await result.current.enter();
      await result.current.exit();
    });

    expect(result.current.active).toBe(false);
  });

  it("does not attach event listeners when no element is attached to the ref", () => {
    setPictureInPictureSupport(true);

    expect(() => {
      renderHook(() => usePictureInPicture());
    }).not.toThrow();
  });

  it("removes listeners on unmount", async () => {
    setPictureInPictureSupport(true);
    const video = renderPipVideo();
    const element = video.current.ref.current;

    video.unmount();

    await act(async () => {
      element?.dispatchEvent(new Event("enterpictureinpicture"));
    });

    expect(video.current.active).toBe(false);
  });
});
