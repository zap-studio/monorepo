import { useCallback, useEffect, useRef, useState } from "react";

import { isUpdaterFunction } from "./_updater.ts";

const DEFAULT_CAPACITY = 100;

/**
 * `past` and `future` are both stored newest-first, so the entry `undo()`
 * and `redo()` need is always the head. That lets {@link isNonEmptyStack}
 * narrow them to a tuple with a definite first element, which a `.length`
 * check alone cannot express.
 */
interface HistoryStack<T> {
  future: readonly T[];
  past: readonly T[];
  present: T;
}

const isNonEmptyStack = <T>(entries: readonly T[]): entries is readonly [T, ...T[]] =>
  entries.length > 0;

/** The shape returned by `useHistoryState`. */
export interface UseHistoryStateResult<T> {
  canRedo: boolean;
  canUndo: boolean;
  redo: () => void;
  reset: (value: T) => void;
  set: (next: T | ((prev: T) => T)) => void;
  undo: () => void;
  value: T;
}

/**
 * State with undo/redo, backed by a history stack that has a maximum
 * size. `set()` saves the previous value into `past` and clears `future`.
 * Once `past` reaches `capacity`, its oldest entry is dropped. `undo()`
 * and `redo()` move values between `past` and `future` without deleting
 * them, so redoing after an undo brings back exactly what you undid.
 * `reset()` replaces the value and clears both `past` and `future`. This
 * is a general state helper — it has nothing to do with the browser's
 * History API. See `usePopState`/`useNavigation` for that.
 *
 * @example
 * ```tsx
 * const { value, set, undo, redo, canUndo, canRedo } = useHistoryState("");
 * set("hello");
 * if (canUndo) undo();
 * ```
 */
export const useHistoryState = <T>(
  initialValue: T,
  capacity: number = DEFAULT_CAPACITY,
): UseHistoryStateResult<T> => {
  const [stack, setStack] = useState<HistoryStack<T>>({
    future: [],
    past: [],
    present: initialValue,
  });
  const capacityRef = useRef(capacity);
  useEffect(() => {
    capacityRef.current = capacity;
  });

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setStack((prev) => {
      const resolved = isUpdaterFunction(next) ? next(prev.present) : next;
      const past = [prev.present, ...prev.past].slice(0, capacityRef.current);
      return { future: [], past, present: resolved };
    });
  }, []);

  const undo = useCallback(() => {
    setStack((prev) => {
      if (!isNonEmptyStack(prev.past)) {
        return prev;
      }
      const [present, ...past] = prev.past;
      return {
        future: [prev.present, ...prev.future],
        past,
        present,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setStack((prev) => {
      if (!isNonEmptyStack(prev.future)) {
        return prev;
      }
      const [present, ...future] = prev.future;
      return { future, past: [prev.present, ...prev.past], present };
    });
  }, []);

  const reset = useCallback((value: T) => {
    setStack({ future: [], past: [], present: value });
  }, []);

  return {
    canRedo: stack.future.length > 0,
    canUndo: stack.past.length > 0,
    redo,
    reset,
    set,
    undo,
    value: stack.present,
  };
};
