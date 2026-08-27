import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalIdleDetector } from "./use-experimental-idle-detector.ts";

const createIdleDetectorMock = (state: { screenState: string; userState: string }) => {
  // SAFETY: the assignments right below set every field of the intersection type (screenState, start, userState), so this EventTarget really does satisfy the IdleDetector-shaped mock by the time any test reads from it.
  const detector = new EventTarget() as EventTarget & {
    screenState: string;
    start: (options: { signal?: AbortSignal; threshold?: number }) => Promise<void>;
    userState: string;
  };
  detector.userState = state.userState;
  detector.screenState = state.screenState;
  detector.start = vi.fn<() => Promise<undefined>>().mockResolvedValue(undefined);

  return {
    detector,
    fireChange: (next: { screenState: string; userState: string }) => {
      detector.userState = next.userState;
      detector.screenState = next.screenState;
      detector.dispatchEvent(new Event("change"));
    },
  };
};

const stubIdleDetector = (options: {
  detector?: ReturnType<typeof createIdleDetectorMock>["detector"];
  requestPermission: () => Promise<"denied" | "granted" | "prompt">;
}) => {
  const IdleDetectorCtor = Object.assign(
    vi.fn().mockImplementation(function IdleDetector() {
      return options.detector;
    }),
    { requestPermission: options.requestPermission },
  );
  vi.stubGlobal("IdleDetector", IdleDetectorCtor);
  return IdleDetectorCtor;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalIdleDetector", () => {
  it("reports supported: false when the Idle Detection API is unavailable", () => {
    vi.stubGlobal("IdleDetector", undefined);

    const { result } = renderHook(() => useExperimentalIdleDetector());

    expect(result.current.supported).toBe(false);
    expect(result.current.userState).toBeUndefined();
    expect(result.current.screenState).toBeUndefined();
  });

  it("reports supported: true when window.IdleDetector exists", () => {
    stubIdleDetector({ requestPermission: () => Promise.resolve("granted") });

    const { result } = renderHook(() => useExperimentalIdleDetector());

    expect(result.current.supported).toBe(true);
  });

  it("requestPermission() resolves false without asking when unsupported", async () => {
    vi.stubGlobal("IdleDetector", undefined);

    const { result } = renderHook(() => useExperimentalIdleDetector());

    await expect(result.current.requestPermission()).resolves.toBe(false);
  });

  it("start() resolves false without constructing a detector when unsupported", async () => {
    vi.stubGlobal("IdleDetector", undefined);

    const { result } = renderHook(() => useExperimentalIdleDetector());
    const started = await result.current.start();

    expect(started).toBe(false);
  });

  it("start() resolves false and cleans up when the detector fails to start", async () => {
    const { detector } = createIdleDetectorMock({ screenState: "unlocked", userState: "active" });
    detector.start = vi
      .fn<() => Promise<undefined>>()
      .mockRejectedValue(new Error("permission denied"));
    stubIdleDetector({ detector, requestPermission: () => Promise.resolve("granted") });

    const { result } = renderHook(() => useExperimentalIdleDetector());
    const started = await result.current.start();

    expect(started).toBe(false);
    expect(result.current.userState).toBeUndefined();
    expect(result.current.screenState).toBeUndefined();
  });

  it("requestPermission() resolves true only when permission is granted", async () => {
    stubIdleDetector({ requestPermission: () => Promise.resolve("granted") });

    const { result } = renderHook(() => useExperimentalIdleDetector());

    await expect(result.current.requestPermission()).resolves.toBe(true);
  });

  it("requestPermission() resolves false when permission is denied", async () => {
    stubIdleDetector({ requestPermission: () => Promise.resolve("denied") });

    const { result } = renderHook(() => useExperimentalIdleDetector());

    await expect(result.current.requestPermission()).resolves.toBe(false);
  });

  it("start() resolves false without starting when permission is denied", async () => {
    const IdleDetectorCtor = stubIdleDetector({
      requestPermission: () => Promise.resolve("denied"),
    });

    const { result } = renderHook(() => useExperimentalIdleDetector());
    const started = await result.current.start();

    expect(started).toBe(false);
    expect(IdleDetectorCtor).not.toHaveBeenCalled();
  });

  it("start() reports userState/screenState once granted and updates on change", async () => {
    const { detector, fireChange } = createIdleDetectorMock({
      screenState: "unlocked",
      userState: "active",
    });
    stubIdleDetector({ detector, requestPermission: () => Promise.resolve("granted") });

    const { result } = renderHook(() => useExperimentalIdleDetector());

    await act(async () => {
      await result.current.start({ threshold: 60_000 });
    });

    await waitFor(() => {
      expect(result.current.userState).toBe("active");
      expect(result.current.screenState).toBe("unlocked");
    });

    await act(async () => {
      fireChange({ screenState: "locked", userState: "idle" });
    });

    expect(result.current.userState).toBe("idle");
    expect(result.current.screenState).toBe("locked");
  });

  it("stop() aborts the detector and resets state", async () => {
    const { detector } = createIdleDetectorMock({ screenState: "unlocked", userState: "active" });
    stubIdleDetector({ detector, requestPermission: () => Promise.resolve("granted") });

    const { result } = renderHook(() => useExperimentalIdleDetector());

    await act(async () => {
      await result.current.start();
    });
    await waitFor(() => expect(result.current.userState).toBe("active"));

    act(() => {
      result.current.stop();
    });

    expect(result.current.userState).toBeUndefined();
    expect(result.current.screenState).toBeUndefined();
  });
});
