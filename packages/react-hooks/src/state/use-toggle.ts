import { useCallback, useState } from "react";

/** The tuple returned by `useToggle`. */
export type UseToggleResult = [value: boolean, toggle: (next?: boolean) => void];

/**
 * Boolean state with a `toggle()` function. Call it with no argument to
 * flip the value, or pass `true`/`false` to set it directly.
 *
 * @example
 * ```tsx
 * const [isOpen, toggleOpen] = useToggle();
 * <button onClick={() => toggleOpen()}>Toggle</button>
 * <button onClick={() => toggleOpen(false)}>Close</button>
 * ```
 */
export const useToggle = (initialValue = false): UseToggleResult => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback((next?: boolean): void => {
    setValue((prev) => (next === undefined ? !prev : next));
  }, []);

  return [value, toggle];
};
