import { useEffect, useState } from "react";

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
  const [state, setState] = useState<PermissionState | undefined>(undefined);
  const [status, setStatus] = useState<PermissionStatus | undefined>(undefined);

  useEffect(() => {
    const permissions = navigator.permissions;
    if (!permissions) {
      setState(undefined);
      return undefined;
    }

    let isMounted = true;

    void (async () => {
      const result = await permissions.query({ name });
      if (!isMounted) {
        return;
      }
      setStatus(result);
      setState(result.state);
    })();

    return () => {
      isMounted = false;
    };
  }, [name]);

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
