import { useCallback, useRef, useState } from "react";

const DEFAULT_CAPACITY = 100;

interface HistoryStack<T> {
  future: readonly T[];
  past: readonly T[];
  present: T;
}

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
 * State with undo/redo, backed by a bounded history stack — `set()` pushes
 * the previous value onto `past` (dropping the oldest entry once `past`
 * reaches `capacity`) and clears `future`; `undo()`/`redo()` move the
 * boundary between `past`/`future` without discarding either side, so
 * redoing after an undo restores exactly what was undone. `reset()`
 * replaces `value` and clears both stacks. Generic state utility, unrelated
 * to the browser History API — see `usePopState`/`useNavigation` for that.
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
  capacityRef.current = capacity;

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setStack((prev) => {
      // SAFETY: T | ((prev: T) => T); the typeof check narrows to the function branch, so this cast just recovers the parameter type TS can't infer through a bare `typeof x === "function"` guard on a generic union.
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev.present) : next;
      const past = [...prev.past, prev.present].slice(-capacityRef.current);
      return { future: [], past, present: resolved };
    });
  }, []);

  const undo = useCallback(() => {
    setStack((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }
      const previous = prev.past.at(-1);
      // SAFETY: the length check above guarantees at least one element, so `at(-1)` is never undefined here.
      const present = previous as T;
      return {
        future: [prev.present, ...prev.future],
        past: prev.past.slice(0, -1),
        present,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setStack((prev) => {
      const [next, ...rest] = prev.future;
      if (prev.future.length === 0) {
        return prev;
      }
      // SAFETY: the length check above guarantees at least one element, so the destructured first element is never undefined here.
      const present = next as T;
      return { future: rest, past: [...prev.past, prev.present], present };
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
