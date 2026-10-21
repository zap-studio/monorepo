import { useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** The shape returned by `usePointer`. */
export interface PointerState {
  clientX: number;
  clientY: number;
  isDown: boolean;
  pointerType: string;
  pressure: number;
}

const INITIAL_STATE: PointerState = {
  clientX: 0,
  clientY: 0,
  isDown: false,
  pointerType: "",
  pressure: 0,
};

/**
 * Tracks mouse, touch, and pen input together, using Pointer events. It
 * listens for `pointerdown`, `pointermove`, and `pointerup` on `window`.
 * This covers more input types than a simple `mousemove` hook.
 *
 * `isDown` is `true` while the pointer (finger, pen, or mouse button) is
 * pressed down. All values start at `0`, `false`, or `""` — this is also
 * the safe default for server-side rendering — until the first pointer
 * event happens.
 *
 * The listeners attach early, before the browser paints. This makes sure
 * a `pointerup` event is never missed, so `isDown` does not get stuck at
 * `true`.
 *
 * @example
 * ```tsx
 * const { clientX, clientY, pointerType, isDown } = usePointer();
 * ```
 */
export const usePointer = (): PointerState => {
  const [state, setState] = useState<PointerState>(INITIAL_STATE);

  useIsomorphicLayoutEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      setState({
        clientX: event.clientX,
        clientY: event.clientY,
        isDown: true,
        pointerType: event.pointerType,
        pressure: event.pressure,
      });
    };
    const handlePointerMove = (event: PointerEvent) => {
      setState((previous) => ({
        clientX: event.clientX,
        clientY: event.clientY,
        isDown: previous.isDown,
        pointerType: event.pointerType,
        pressure: event.pressure,
      }));
    };
    const handlePointerUp = (event: PointerEvent) => {
      setState({
        clientX: event.clientX,
        clientY: event.clientY,
        isDown: false,
        pointerType: event.pointerType,
        pressure: event.pressure,
      });
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return state;
};
