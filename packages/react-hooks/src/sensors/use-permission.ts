import { useEffect, useState } from "react";

/**
 * `navigator.permissions.query({ name })`'s state for the given permission
 * (`"granted" | "denied" | "prompt"`), updating on the query result's
 * `change` event. `undefined` — the SSR-safe default — until the client
 * resolves it, and permanently where the Permissions API is unsupported.
 *
 * @example
 * ```tsx
 * const cameraPermission = usePermission("camera");
 * ```
 */
export const usePermission = (name: PermissionName): PermissionState | undefined => {
  const [state, setState] = useState<PermissionState | undefined>(undefined);

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- the returned cleanup does call the `cleanup` closure variable, which removes the "change" listener added in `subscribeToPermission`; the detector's cleanup matcher misses it because the removeEventListener call sits behind that indirection instead of literally inline in the returned function.
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
