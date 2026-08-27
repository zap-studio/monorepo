import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { VirtualKeyboard } from "./use-experimental-virtual-keyboard.ts";

import { useExperimentalVirtualKeyboard } from "./use-experimental-virtual-keyboard.ts";

const createVirtualKeyboardMock = (initial: {
  height: number;
  width: number;
  x: number;
  y: number;
}) => {
  const keyboard = new EventTarget() as unknown as VirtualKeyboard;
  let rect = { ...initial };

  Object.defineProperty(keyboard, "boundingRect", {
    configurable: true,
    get: () => rect,
  });

  return {
    keyboard,
    setRect: (next: Partial<typeof rect>) => {
      rect = { ...rect, ...next };
      keyboard.dispatchEvent(new Event("geometrychange"));
    },
  };
};

const setNavigatorVirtualKeyboard = (keyboard: VirtualKeyboard | undefined) => {
  Object.defineProperty(navigator, "virtualKeyboard", { configurable: true, value: keyboard });
};

describe(useExperimentalVirtualKeyboard, () => {
  it("reports the current on-screen keyboard bounding rect", () => {
    const { keyboard } = createVirtualKeyboardMock({ height: 300, width: 400, x: 0, y: 500 });
    setNavigatorVirtualKeyboard(keyboard);

    const { result } = renderHook(() => useExperimentalVirtualKeyboard());

    expect(result.current).toEqual({ height: 300, width: 400, x: 0, y: 500 });
  });

  it("updates when the keyboard fires a geometrychange event", async () => {
    const { keyboard, setRect } = createVirtualKeyboardMock({ height: 0, width: 0, x: 0, y: 0 });
    setNavigatorVirtualKeyboard(keyboard);

    const { result } = renderHook(() => useExperimentalVirtualKeyboard());
    expect(result.current.height).toBe(0);

    await act(async () => {
      setRect({ height: 280 });
    });

    expect(result.current.height).toBe(280);
  });

  it("falls back to zeroed rect when the VirtualKeyboard API is unsupported", () => {
    setNavigatorVirtualKeyboard(undefined);

    const { result } = renderHook(() => useExperimentalVirtualKeyboard());

    expect(result.current).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });
});
