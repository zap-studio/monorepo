import { useEffect, useRef } from "react";

/**
 * Runs `cleanup` exactly once, when the component unmounts. It always
 * calls the latest version of `cleanup`, so you don't need to memoize it
 * or worry about dependency arrays like you would with a raw `useEffect`
 * cleanup.
 *
 * @example
 * ```tsx
 * useUnmount(() => socket.close());
 * ```
 */
export const useUnmount = (cleanup: () => void): void => {
  const cleanupRef = useRef(cleanup);
  useEffect(() => {
    cleanupRef.current = cleanup;
  });

  useEffect(() => () => cleanupRef.current(), []);
};
