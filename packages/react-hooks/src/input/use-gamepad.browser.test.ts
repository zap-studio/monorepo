import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useGamepad } from "./use-gamepad.ts";

// `useGamepad` never reads `vibrationActuator` (see COMPARED_FIELDS in use-gamepad.ts), so this
// stub only needs to satisfy `GamepadHapticActuator`'s two methods, never actually call them.
const noopVibrationActuator: GamepadHapticActuator = {
  playEffect: () => Promise.resolve("complete"),
  reset: () => Promise.resolve("complete"),
};

const makeGamepad = (overrides: Partial<Gamepad> = {}): Gamepad => {
  const gamepad: Gamepad = {
    axes: [],
    buttons: [],
    connected: true,
    id: "Test Gamepad",
    index: 0,
    mapping: "standard",
    timestamp: 0,
    vibrationActuator: noopVibrationActuator,
    ...overrides,
  };
  return gamepad;
};

const setGamepads = (gamepads: Array<Gamepad | null> | undefined) => {
  Object.defineProperty(navigator, "getGamepads", {
    configurable: true,
    value: gamepads === undefined ? undefined : () => gamepads,
  });
};

afterEach(() => {
  setGamepads([]);
});

describe("useGamepad", () => {
  it("starts with no connected gamepads", () => {
    setGamepads([]);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([]);
  });

  it("reflects gamepads already present on mount", () => {
    const pad = makeGamepad({ id: "Pad A", index: 0 });
    setGamepads([pad]);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([pad]);
  });

  it("adds a gamepad when gamepadconnected fires", async () => {
    setGamepads([]);

    const { result } = renderHook(() => useGamepad());
    expect(result.current).toEqual([]);

    const pad = makeGamepad({ id: "Pad A", index: 0 });
    await act(async () => {
      setGamepads([pad]);
      window.dispatchEvent(new Event("gamepadconnected"));
    });

    expect(result.current).toEqual([pad]);
  });

  it("removes a gamepad when gamepaddisconnected fires", async () => {
    setGamepads([makeGamepad({ id: "Pad A", index: 0 })]);

    const { result } = renderHook(() => useGamepad());
    expect(result.current).toHaveLength(1);

    await act(async () => {
      setGamepads([]);
      window.dispatchEvent(new Event("gamepaddisconnected"));
    });

    expect(result.current).toEqual([]);
  });

  it("skips null slots returned by getGamepads()", () => {
    const pad = makeGamepad({ id: "Pad B", index: 1 });
    setGamepads([null, pad, null]);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([pad]);
  });

  it("returns an empty array when the Gamepad API is unsupported", () => {
    setGamepads(undefined);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([]);
  });
});
