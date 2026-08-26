import { useCallback, useRef, useSyncExternalStore } from "react";

/** One connected gamepad, as reported by `useGamepad`. */
export interface GamepadInfo {
  id: string;
  index: number;
  mapping: GamepadMappingType;
}

const EMPTY_GAMEPADS: GamepadInfo[] = [];

const readGamepads = (): GamepadInfo[] => {
  if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") {
    return EMPTY_GAMEPADS;
  }
  const pads: GamepadInfo[] = [];
  for (const pad of navigator.getGamepads()) {
    if (pad) {
      pads.push({ id: pad.id, index: pad.index, mapping: pad.mapping });
    }
  }
  return pads;
};

const gamepadsEqual = (a: GamepadInfo[], b: GamepadInfo[]): boolean =>
  a.length === b.length &&
  a.every(
    (pad, i) => pad.id === b[i]?.id && pad.index === b[i]?.index && pad.mapping === b[i]?.mapping,
  );

const getServerSnapshot = (): GamepadInfo[] => EMPTY_GAMEPADS;

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("gamepadconnected", onStoreChange);
  window.addEventListener("gamepaddisconnected", onStoreChange);
  return () => {
    window.removeEventListener("gamepadconnected", onStoreChange);
    window.removeEventListener("gamepaddisconnected", onStoreChange);
  };
};

/**
 * The gamepads currently connected, from `navigator.getGamepads()`.
 * Updates when a gamepad connects or disconnects.
 *
 * This only gives you `id`, `index`, and `mapping` for each gamepad.
 * Reading live button and joystick state needs polling on an animation
 * frame, which is outside what this hook does.
 *
 * Returns `[]` during server rendering, before the client subscribes,
 * and where the Gamepad API isn't supported.
 *
 * @example
 * ```tsx
 * const gamepads = useGamepad();
 * const isControllerConnected = gamepads.length > 0;
 * ```
 */
export const useGamepad = (): GamepadInfo[] => {
  const cacheRef = useRef<GamepadInfo[]>(EMPTY_GAMEPADS);

  const getSnapshot = useCallback((): GamepadInfo[] => {
    const next = readGamepads();
    if (!gamepadsEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
