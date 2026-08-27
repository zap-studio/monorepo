import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useVibrate } from "./use-vibrate.ts";

const setNavigatorVibrate = (vibrate: ((pattern: VibratePattern) => boolean) | undefined) => {
  Object.defineProperty(navigator, "vibrate", { configurable: true, value: vibrate });
};

describe("useVibrate", () => {
  it("reports supported: true when navigator.vibrate exists", () => {
    setNavigatorVibrate(vi.fn(() => true));

    const { result } = renderHook(() => useVibrate());

    expect(result.current.supported).toBe(true);
  });

  it("reports supported: false when navigator.vibrate is unavailable", () => {
    setNavigatorVibrate(undefined);

    const { result } = renderHook(() => useVibrate());

    expect(result.current.supported).toBe(false);
  });

  it("calls navigator.vibrate with the given pattern and returns its result", () => {
    const vibrate = vi.fn<() => boolean>(() => true);
    setNavigatorVibrate(vibrate);

    const { result } = renderHook(() => useVibrate());

    expect(result.current.vibrate([100, 50, 100])).toBe(true);
    expect(vibrate).toHaveBeenCalledWith([100, 50, 100]);
  });

  it("no-ops and returns false when unsupported", () => {
    setNavigatorVibrate(undefined);

    const { result } = renderHook(() => useVibrate());

    expect(result.current.vibrate(200)).toBe(false);
  });
});
