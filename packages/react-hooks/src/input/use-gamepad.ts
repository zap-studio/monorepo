import { useCallback, useRef, useSyncExternalStore } from "react";

const EMPTY_GAMEPADS: Gamepad[] = [];

const readGamepads = (): Gamepad[] => {
  if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") {
    return EMPTY_GAMEPADS;
  }
  const pads: Gamepad[] = [];
  for (const pad of navigator.getGamepads()) {
    if (pad) {
      pads.push(pad);
    }
  }
  return pads;
};

const COMPARED_FIELDS = ["id", "index", "mapping", "connected", "timestamp"] as const;

const gamepadEqual = (a: Gamepad, b: Gamepad | undefined): boolean =>
  COMPARED_FIELDS.every((field) => a[field] === b?.[field]);

const gamepadsEqual = (a: Gamepad[], b: Gamepad[]): boolean =>
  a.length === b.length && a.every((pad, i) => gamepadEqual(pad, b[i]));

const getServerSnapshot = (): Gamepad[] => EMPTY_GAMEPADS;

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
 * The returned snapshot is re-read on every connect/disconnect event, but
 * live button and joystick state still needs polling on an animation
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
export const useGamepad = (): Gamepad[] => {
  const cacheRef = useRef<Gamepad[]>(EMPTY_GAMEPADS);

  const getSnapshot = useCallback((): Gamepad[] => {
    const next = readGamepads();
    if (!gamepadsEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
