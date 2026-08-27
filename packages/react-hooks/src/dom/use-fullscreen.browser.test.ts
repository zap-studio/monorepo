import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFullscreen } from "./use-fullscreen.ts";

const setFullscreenSupport = (supported: boolean) => {
  Object.defineProperty(document, "fullscreenEnabled", {
    configurable: true,
    value: supported,
  });
};

const setFullscreenElement = (element: Element | null) => {
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    value: element,
  });
};

afterEach(() => {
  setFullscreenSupport(true);
  setFullscreenElement(null);
});

describe("useFullscreen", () => {
  it("reports supported: true when the Fullscreen API exists", () => {
    setFullscreenSupport(true);

    const { result } = renderHook(() => useFullscreen());

    expect(result.current.supported).toBe(true);
    expect(result.current.isFullscreen).toBe(false);
  });

  it("reports supported: false when the Fullscreen API is unavailable", () => {
    setFullscreenSupport(false);

    const { result } = renderHook(() => useFullscreen());

    expect(result.current.supported).toBe(false);
  });

  it("enter() requests fullscreen on the ref'd element", async () => {
    setFullscreenSupport(true);
    const requestFullscreen = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const element = { requestFullscreen } as unknown as HTMLDivElement;

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      await result.current.enter();
    });

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("enter() no-ops when no element is attached to the ref", async () => {
    setFullscreenSupport(true);

    const { result } = renderHook(() => useFullscreen());

    await expect(result.current.enter()).resolves.toBeUndefined();
  });

  it("becomes fullscreen when fullscreenchange fires with the ref'd element active", async () => {
    setFullscreenSupport(true);
    const element = { requestFullscreen: vi.fn() } as unknown as HTMLDivElement;

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      setFullscreenElement(element);
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    expect(result.current.isFullscreen).toBe(true);
  });

  it("becomes not fullscreen when a different element is active", async () => {
    setFullscreenSupport(true);
    const element = { requestFullscreen: vi.fn() } as unknown as HTMLDivElement;
    const other = { requestFullscreen: vi.fn() } as unknown as HTMLDivElement;

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      setFullscreenElement(element);
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(result.current.isFullscreen).toBe(true);

    await act(async () => {
      setFullscreenElement(other);
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it("exit() calls document.exitFullscreen() when this element is active", async () => {
    setFullscreenSupport(true);
    const element = document.createElement("div");
    const exitFullscreen = vi.fn<() => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;
    setFullscreenElement(element);

    await act(async () => {
      await result.current.exit();
    });

    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it("exit() no-ops when a different element is active", async () => {
    setFullscreenSupport(true);
    const element = document.createElement("div");
    const other = document.createElement("div");
    const exitFullscreen = vi.fn<() => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;
    setFullscreenElement(other);

    await act(async () => {
      await result.current.exit();
    });

    expect(exitFullscreen).not.toHaveBeenCalled();
  });

  it("enter()/exit() no-op when unsupported", async () => {
    setFullscreenSupport(false);
    const element = document.createElement("div");

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      await result.current.enter();
      await result.current.exit();
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it("toggle() enters when not fullscreen", async () => {
    setFullscreenSupport(true);
    const requestFullscreen = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const element = { requestFullscreen } as unknown as HTMLDivElement;

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      await result.current.toggle();
    });

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("toggle() exits when this element is fullscreen", async () => {
    setFullscreenSupport(true);
    const element = document.createElement("div");
    const exitFullscreen = vi.fn<() => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;
    setFullscreenElement(element);

    await act(async () => {
      await result.current.toggle();
    });

    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it("removes the fullscreenchange listener on unmount", async () => {
    setFullscreenSupport(true);
    const element = { requestFullscreen: vi.fn() } as unknown as HTMLDivElement;

    const { result, unmount } = renderHook(() => useFullscreen<HTMLDivElement>());
    result.current.ref.current = element;
    unmount();

    await act(async () => {
      setFullscreenElement(element);
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    expect(result.current.isFullscreen).toBe(false);
  });
});
