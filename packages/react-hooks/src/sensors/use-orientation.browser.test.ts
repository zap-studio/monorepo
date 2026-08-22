import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useOrientation } from "./use-orientation.ts";

function createOrientationMock(initial: Pick<ScreenOrientation, "angle" | "type">) {
  const info = new EventTarget() as unknown as ScreenOrientation;
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
}

function setScreenOrientation(info: ScreenOrientation | undefined) {
  Object.defineProperty(screen, "orientation", {
    configurable: true,
    get: () => info,
  });
}

describe(useOrientation, () => {
  it("reports the current orientation from screen.orientation", () => {
    const { info } = createOrientationMock({ angle: 90, type: "landscape-primary" });
    setScreenOrientation(info);

    const { result } = renderHook(() => useOrientation());

    expect(result.current).toEqual({ angle: 90, type: "landscape-primary" });
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
      setState({ angle: 90, type: "landscape-primary" });
      window.dispatchEvent(new Event("orientationchange"));
    });

    expect(result.current).toEqual({ angle: 90, type: "landscape-primary" });
  });

  it("falls back to angle 0 when screen.orientation is unsupported", () => {
    setScreenOrientation(undefined);

    const { result } = renderHook(() => useOrientation());

    expect(result.current).toEqual({ angle: 0, type: undefined });
  });
});
