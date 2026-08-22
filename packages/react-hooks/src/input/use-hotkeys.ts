import { useEffect, useRef } from "react";

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
 * Registers keyboard shortcuts as `"ctrl+s"`-style combo strings mapped to
 * handlers, matched on `keydown` against `window`. Modifiers (`ctrl`/
 * `control`, `shift`, `alt`, `meta`/`cmd`/`command`) must all match exactly
 * — a plain `"s"` binding never fires while `ctrl` is held. `bindings`
 * doesn't need to be memoized — the latest map is always read, without
 * re-subscribing.
 *
 * @example
 * ```tsx
 * useHotkeys({ "ctrl+s": save, "shift+enter": submit }, { preventDefault: true });
 * ```
 */
export const useHotkeys = (bindings: HotkeyBindings, options: UseHotkeysOptions = {}): void => {
  const { enabled = true, preventDefault = false } = options;
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
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
