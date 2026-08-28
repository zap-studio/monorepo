import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useOrientation } from "./use-orientation.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

const LANDSCAPE_PRIMARY = "landscape-primary";

const createOrientationMock = (initial: Pick<ScreenOrientation, "angle" | "type">) => {
  // SAFETY: the hook only calls addEventListener/removeEventListener (inherited from
  // EventTarget) and reads the `angle`/`type` getters defined via Object.defineProperties below.
  const info = asTestDouble<ScreenOrientation>(new EventTarget());
  let state = { ...initial };

  Object.defineProperties(info, {
    angle: { configurable: true, get: () => state.angle },
    type: { configurable: true, get: () => state.type },
  });

  return {
    info,
    setState: (next: Partial<typeof state>) => {
      state = { ...state, ...next };
      info.dispatchEvent(new Event("change"));
    },
  };
};

const setScreenOrientation = (info: ScreenOrientation | undefined) => {
  Object.defineProperty(screen, "orientation", {
    configurable: true,
    get: () => info,
  });
};

describe("useOrientation", () => {
  it("reports the current orientation from screen.orientation", () => {
    const { info } = createOrientationMock({ angle: 90, type: LANDSCAPE_PRIMARY });
    setScreenOrientation(info);

    const { result } = renderHook(() => useOrientation());

    expect(result.current).toEqual({ angle: 90, type: LANDSCAPE_PRIMARY });
  });

  it("updates when screen.orientation fires a change event", async () => {
    const { info, setState } = createOrientationMock({ angle: 0, type: "portrait-primary" });
    setScreenOrientation(info);

    const { result } = renderHook(() => useOrientation());
    expect(result.current.angle).toBe(0);

    await act(async () => {
      setState({ angle: 180, type: "portrait-secondary" });
    });

    expect(result.current).toEqual({ angle: 180, type: "portrait-secondary" });
  });

  it("updates on the legacy window orientationchange event too", async () => {
    const { info, setState } = createOrientationMock({ angle: 0, type: "portrait-primary" });
    setScreenOrientation(info);

    const { result } = renderHook(() => useOrientation());

    await act(async () => {
      setState({ angle: 90, type: LANDSCAPE_PRIMARY });
      window.dispatchEvent(new Event("orientationchange"));
    });

    expect(result.current).toEqual({ angle: 90, type: LANDSCAPE_PRIMARY });
  });

  it("falls back to angle 0 when screen.orientation is unsupported", () => {
    setScreenOrientation(undefined);

    const { result } = renderHook(() => useOrientation());

    expect(result.current).toEqual({ angle: 0 });
  });
});
