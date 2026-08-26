import { useEffect, useState } from "react";

/** The shape returned by `useStorageEstimate`. */
export interface StorageEstimateState {
  quota?: number;
  supported: boolean;
  usage?: number;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.storage?.estimate === "function";

const INITIAL_STATE: StorageEstimateState = { supported: false };

/**
 * Reads `usage` and `quota` from `navigator.storage.estimate()` once, when
 * the component mounts. It does not update or refresh after that.
 * `supported` tells you if the Storage API is available. The default
 * value, `{ supported: false }`, is also what you get when the API isn't
 * available.
 *
 * @example
 * ```tsx
 * const { usage, quota, supported } = useStorageEstimate();
 * ```
 */
export const useStorageEstimate = (): StorageEstimateState => {
  const [state, setState] = useState<StorageEstimateState>(INITIAL_STATE);

  useEffect(() => {
    if (!isSupported()) {
      setState({ supported: false });
      return undefined;
    }

    setState({ supported: true });

    let cancelled = false;

    const fetchEstimate = async () => {
      const estimate = await navigator.storage.estimate();
      if (cancelled) {
        return;
      }
      setState({
        ...(estimate.quota !== undefined && { quota: estimate.quota }),
        supported: true,
        ...(estimate.usage !== undefined && { usage: estimate.usage }),
      });
    };

    void fetchEstimate();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
