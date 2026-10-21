import { useCallback, useRef, useSyncExternalStore } from "react";

const FALLBACK_TEXT = "";

const readSelectionText = (): string => window.getSelection()?.toString() ?? FALLBACK_TEXT;

const getServerSnapshot = (): string => FALLBACK_TEXT;

const subscribe = (onStoreChange: () => void) => {
  document.addEventListener("selectionchange", onStoreChange);
  return () => document.removeEventListener("selectionchange", onStoreChange);
};

/**
 * The text currently selected on the page, read with
 * `window.getSelection()`. It updates whenever the document's
 * `selectionchange` event fires. Falls back to `""` during server
 * rendering, and before the client starts listening.
 *
 * @example
 * ```tsx
 * const text = useTextSelection();
 * const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
 * ```
 */
export const useTextSelection = (): string => {
  const cacheRef = useRef<string>(FALLBACK_TEXT);

  const getSnapshot = useCallback((): string => {
    const next = readSelectionText();
    if (cacheRef.current !== next) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
