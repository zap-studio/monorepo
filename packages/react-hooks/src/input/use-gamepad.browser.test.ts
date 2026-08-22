import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useGamepad } from "./use-gamepad.ts";

function makeGamepad(overrides: Partial<Gamepad> = {}): Gamepad {
  return {
    axes: [],
    buttons: [],
    connected: true,
    hapticActuators: [],
    id: "Test Gamepad",
    index: 0,
    mapping: "standard",
    timestamp: 0,
    vibrationActuator: null,
    ...overrides,
  } as Gamepad;
}

function setGamepads(gamepads: Array<Gamepad | null> | undefined) {
  Object.defineProperty(navigator, "getGamepads", {
    configurable: true,
    value: gamepads === undefined ? undefined : () => gamepads,
  });
}

afterEach(() => {
  setGamepads([]);
});

describe(useGamepad, () => {
  it("starts with no connected gamepads", () => {
    setGamepads([]);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([]);
  });

  it("reflects gamepads already present on mount", () => {
    setGamepads([makeGamepad({ id: "Pad A", index: 0 })]);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([{ id: "Pad A", index: 0, mapping: "standard" }]);
  });

  it("adds a gamepad when gamepadconnected fires", async () => {
    setGamepads([]);

    const { result } = renderHook(() => useGamepad());
    expect(result.current).toEqual([]);

    await act(async () => {
      setGamepads([makeGamepad({ id: "Pad A", index: 0 })]);
      window.dispatchEvent(new Event("gamepadconnected"));
    });

    expect(result.current).toEqual([{ id: "Pad A", index: 0, mapping: "standard" }]);
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
    setGamepads([null, makeGamepad({ id: "Pad B", index: 1 }), null]);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([{ id: "Pad B", index: 1, mapping: "standard" }]);
  });

  it("returns an empty array when the Gamepad API is unsupported", () => {
    setGamepads(undefined);

    const { result } = renderHook(() => useGamepad());

    expect(result.current).toEqual([]);
  });
});
