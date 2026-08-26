import { useRef } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** A combo string (e.g. `"ctrl+s"`, `"shift+enter"`) mapped to a handler, as passed to `useHotkeys`. */
export type HotkeyBindings = Record<string, () => void>;

/** Options accepted by `useHotkeys`. */
export interface UseHotkeysOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

interface ParsedCombo {
  alt: boolean;
  ctrl: boolean;
  key: string;
  meta: boolean;
  shift: boolean;
}

const parseCombo = (combo: string): ParsedCombo => {
  const parts = combo
    .split("+")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const key = parts.at(-1) ?? "";
  return {
    alt: parts.includes("alt"),
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    key,
    meta: parts.includes("meta") || parts.includes("cmd") || parts.includes("command"),
    shift: parts.includes("shift"),
  };
};

const matchesCombo = (event: KeyboardEvent, combo: ParsedCombo): boolean =>
  event.key.toLowerCase() === combo.key &&
  event.ctrlKey === combo.ctrl &&
  event.shiftKey === combo.shift &&
  event.altKey === combo.alt &&
  event.metaKey === combo.meta;

/**
 * Registers keyboard shortcuts using combo strings like `"ctrl+s"`,
 * mapped to handler functions. Matches against `keydown` events on
 * `window`. All modifiers you list (`ctrl`/`control`, `shift`, `alt`,
 * `meta`/`cmd`/`command`) must be held exactly — a plain `"s"` binding
 * never fires while `ctrl` is also held.
 *
 * You don't need to memoize `bindings`. This hook always reads the
 * latest map without re-subscribing the listener.
 *
 * The listener attaches in a layout effect, before the browser paints.
 * This matters because a `keydown` event missed in that gap would also
 * lose its `preventDefault()` call, letting the browser's default action
 * happen instead.
 *
 * @example
 * ```tsx
 * useHotkeys({ "ctrl+s": save, "shift+enter": submit }, { preventDefault: true });
 * ```
 */
export const useHotkeys = (bindings: HotkeyBindings, options: UseHotkeysOptions = {}): void => {
  const { enabled = true, preventDefault = false } = options;
  const bindingsRef = useRef(bindings);
  useIsomorphicLayoutEffect(() => {
    bindingsRef.current = bindings;
  });

  useIsomorphicLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const [combo, handler] of Object.entries(bindingsRef.current)) {
        if (matchesCombo(event, parseCombo(combo))) {
          if (preventDefault) {
            event.preventDefault();
          }
          handler();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, preventDefault]);
};
