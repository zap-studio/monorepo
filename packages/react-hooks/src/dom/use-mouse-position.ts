import { useEffect, useState } from "react";

/** The shape returned by `useMousePosition`. */
export interface MousePosition {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
}

const INITIAL_POSITION: MousePosition = {
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  screenX: 0,
  screenY: 0,
};

const toPosition = (event: MouseEvent): MousePosition => ({
  clientX: event.clientX,
  clientY: event.clientY,
  pageX: event.pageX,
  pageY: event.pageY,
  screenX: event.screenX,
  screenY: event.screenY,
});

/**
 * Tracks the mouse position using `window`'s `mousemove` event. Returns
 * `clientX`/`clientY`, plus `pageX`/`pageY` and `screenX`/`screenY`.
 *
 * There is no way to read the mouse position directly, only through this
 * event. So all values start at `0` (also the safe default for
 * server-side rendering) until the mouse first moves.
 *
 * @example
 * ```tsx
 * const { clientX, clientY } = useMousePosition();
 * ```
 */
export const useMousePosition = (): MousePosition => {
  const [position, setPosition] = useState<MousePosition>(INITIAL_POSITION);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition(toPosition(event));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
};
