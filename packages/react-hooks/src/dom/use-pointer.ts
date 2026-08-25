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
 * Unified mouse/touch/pen position and pressure via Pointer events — a
 * modern superset of a plain `mousemove`-based position hook, tracking
 * `pointerdown`/`pointermove`/`pointerup` on `window`. `isDown` reflects
 * whether the primary pointer button/contact is currently active. Starts
 * all-`0`/`false`/`""` — also the SSR-safe default — until the first
 * pointer event fires. The listeners attach in a layout effect, before the
 * browser paints, so a `pointerup` can't be missed and leave `isDown` stuck
 * at `true`.
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
