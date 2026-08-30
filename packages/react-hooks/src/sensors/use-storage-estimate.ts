import { useEffect, useState } from "react";

import { useIsClient } from "./use-is-client.ts";

/** The shape returned by `useStorageEstimate`. */
export interface StorageEstimateState {
  quota?: number;
  supported: boolean;
  usage?: number;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.storage?.estimate === "function";

interface EstimateData {
  quota?: number;
  usage?: number;
}

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
  const isClient = useIsClient();
  const supported = isClient && isSupported();
  const [data, setData] = useState<EstimateData>({});

  useEffect(() => {
    if (!supported) {
      return undefined;
    }

    let cancelled = false;

    const fetchEstimate = async () => {
      const estimate = await navigator.storage.estimate();
      if (cancelled) {
        return;
      }
      setData({
        ...(estimate.quota !== undefined && { quota: estimate.quota }),
        ...(estimate.usage !== undefined && { usage: estimate.usage }),
      });
    };

    void fetchEstimate();

    return () => {
      cancelled = true;
    };
  }, [supported]);

  return { ...data, supported };
};
