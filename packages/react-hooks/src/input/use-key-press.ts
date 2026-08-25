import { useCallback, useRef, useSyncExternalStore } from "react";

const toKeyList = (keys: string[]): string[] => keys.map((key) => key.toLowerCase());

const getServerSnapshot = (): boolean => false;

/**
 * Tracks whether any of the given key(s) is currently held down, matching
 * `KeyboardEvent.key` case-insensitively via `keydown`/`keyup` on `window`.
 * SSR-safe — returns `false` until the client subscribes. `target` doesn't
 * need to be a stable reference — an array is compared by its contents, so
 * an array literal written inline at the call site doesn't resubscribe on
 * every render.
 *
 * @example
 * ```tsx
 * const isShiftHeld = useKeyPress("Shift");
 * const isArrowHeld = useKeyPress(["ArrowLeft", "ArrowRight"]);
 * ```
 */
export const useKeyPress = (target: string | string[]): boolean => {
  const pressedRef = useRef(false);
  const targetKey = Array.isArray(target) ? target.join("\u0000") : target;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const keys = toKeyList(targetKey.split("\u0000"));

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
    [targetKey],
  );

  const getSnapshot = useCallback(() => pressedRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
