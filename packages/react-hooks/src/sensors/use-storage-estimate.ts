import { useEffect, useState } from "react";

export interface StorageEstimateState {
  quota?: number;
  supported: boolean;
  usage?: number;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.storage?.estimate === "function";

const INITIAL_STATE: StorageEstimateState = { supported: false };

/**
 * `navigator.storage.estimate()`'s `usage`/`quota`, one-shot on mount — no
 * live updates, no refresh. `supported` reflects whether the Storage API is
 * available; `{ supported: false }` — the SSR-safe default — where it
 * isn't.
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
