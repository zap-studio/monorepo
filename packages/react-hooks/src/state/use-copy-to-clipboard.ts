import { useCallback, useEffect, useState } from "react";

/** The shape returned by `useCopyToClipboard`. */
export interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  error: Error | undefined;
}

const isSupported = (): boolean => typeof navigator !== "undefined" && Boolean(navigator.clipboard);

const DEFAULT_RESET_AFTER_MS = 2000;

/**
 * Wraps `navigator.clipboard.writeText()`. Calling `copy(text)` writes
 * text to the clipboard and resolves to `true` on success or `false` on
 * failure. `copied` mirrors that result, then resets to `false` after
 * `resetAfterMs`. If the Clipboard API doesn't exist, `supported` is
 * `false` and `copy()` resolves with an error instead.
 *
 * @example
 * ```tsx
 * const { copy, copied } = useCopyToClipboard();
 * <button onClick={() => copy(code)}>{copied ? "Copied!" : "Copy"}</button>
 * ```
 */
export const useCopyToClipboard = (
  resetAfterMs: number = DEFAULT_RESET_AFTER_MS,
): UseCopyToClipboardResult => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!isSupported()) {
      setError(new Error("Clipboard API is not supported by this browser."));
      setCopied(false);
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      setError(undefined);
      setCopied(true);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
      setCopied(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const id = setTimeout(setCopied, resetAfterMs, false);
    return () => clearTimeout(id);
  }, [copied, resetAfterMs]);

  return { copied, copy, error };
};
