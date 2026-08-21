import { useCallback, useRef, useSyncExternalStore } from "react";

const FALLBACK_TEXT = "";

const readSelectionText = (): string => window.getSelection()?.toString() ?? FALLBACK_TEXT;

const getServerSnapshot = (): string => FALLBACK_TEXT;

const subscribe = (onStoreChange: () => void) => {
  document.addEventListener("selectionchange", onStoreChange);
  return () => document.removeEventListener("selectionchange", onStoreChange);
};

/**
 * The current page text selection, via `window.getSelection()`, updating
 * on the document's `selectionchange` event. Falls back to `""` during
 * server rendering and before the client subscribes.
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
