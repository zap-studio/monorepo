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

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- the cleanup function does remove the "change" listener, through the `cleanup` variable. The linter can't see this because the removeEventListener call is inside that variable, not written directly in the returned function.
  useEffect(() => {
    const permissions = navigator.permissions;
    if (!permissions) {
      setState(undefined);
      return undefined;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const subscribeToPermission = async () => {
      const status = await permissions.query({ name });
      if (cancelled) {
        return;
      }
      setState(status.state);

      const handleChange = () => {
        setState(status.state);
      };

      status.addEventListener("change", handleChange);
      cleanup = () => status.removeEventListener("change", handleChange);
    };

    void subscribeToPermission();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [name]);

  return state;
};
