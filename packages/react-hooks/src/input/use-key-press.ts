import { useCallback, useRef, useSyncExternalStore } from "react";

const toKeyList = (target: string | string[]): string[] =>
  (Array.isArray(target) ? target : [target]).map((key) => key.toLowerCase());

const getServerSnapshot = (): boolean => false;

/**
 * Tracks whether any of the given key(s) is currently held down, matching
 * `KeyboardEvent.key` case-insensitively via `keydown`/`keyup` on `window`.
 * SSR-safe — returns `false` until the client subscribes. Pass a stable
 * array reference (or a single string) to avoid resubscribing every render.
 *
 * @example
 * ```tsx
 * const isShiftHeld = useKeyPress("Shift");
 * const isArrowHeld = useKeyPress(["ArrowLeft", "ArrowRight"]);
 * ```
 */
export const useKeyPress = (target: string | string[]): boolean => {
  const pressedRef = useRef(false);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const keys = toKeyList(target);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (keys.includes(event.key.toLowerCase())) {
          pressedRef.current = true;
          onStoreChange();
        }
      };
      const handleKeyUp = (event: KeyboardEvent) => {
        if (keys.includes(event.key.toLowerCase())) {
          pressedRef.current = false;
          onStoreChange();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    },
    [target],
  );

  const getSnapshot = useCallback(() => pressedRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
