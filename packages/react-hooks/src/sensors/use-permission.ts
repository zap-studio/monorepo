import { useEffect, useState } from "react";

import { useIsClient } from "./use-is-client.ts";

/**
 * Gives you the state of a browser permission (`"granted"`, `"denied"`, or
 * `"prompt"`) using `navigator.permissions.query({ name })`. It updates
 * when the permission changes. The value is `undefined` (the safe default
 * for server rendering) until the client checks it, and it stays
 * `undefined` if the Permissions API isn't supported.
 *
 * @example
 * ```tsx
 * const cameraPermission = usePermission("camera");
 * ```
 */
export const usePermission = (name: PermissionName): PermissionState | undefined => {
  const isClient = useIsClient();
  const supported = isClient && typeof navigator !== "undefined" && !!navigator.permissions;

  const [state, setState] = useState<PermissionState | undefined>(undefined);
  const [status, setStatus] = useState<PermissionStatus | undefined>(undefined);

  useEffect(() => {
    if (!supported) {
      return undefined;
    }

    let isMounted = true;

    void (async () => {
      const result = await navigator.permissions.query({ name });
      if (!isMounted) {
        return;
      }
      setStatus(result);
      setState(result.state);
    })();

    return () => {
      isMounted = false;
    };
  }, [supported, name]);

  useEffect(() => {
    if (!status) {
      return undefined;
    }

    const handleChange = () => {
      setState(status.state);
    };

    status.addEventListener("change", handleChange);

    return () => {
      status.removeEventListener("change", handleChange);
    };
  }, [status]);

  return state;
};
