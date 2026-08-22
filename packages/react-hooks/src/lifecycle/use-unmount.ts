import { useEffect, useRef } from "react";

/**
 * Runs `cleanup` exactly once, on unmount. Always calls the latest
 * `cleanup` — it doesn't need to be memoized, and doesn't need `[]`-style
 * discipline the way a raw `useEffect` cleanup would.
 *
 * @example
 * ```tsx
 * useUnmount(() => socket.close());
 * ```
 */
export const useUnmount = (cleanup: () => void): void => {
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;

  useEffect(() => () => cleanupRef.current(), []);
};
