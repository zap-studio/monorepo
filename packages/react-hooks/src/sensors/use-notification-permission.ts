import { useCallback, useState } from "react";

/** The shape returned by `useNotificationPermission`. */
export interface UseNotificationPermissionResult {
  notify: (title: string, options?: NotificationOptions) => Notification | undefined;
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<NotificationPermission>;
}

const isSupported = (): boolean => typeof window !== "undefined" && Boolean(window.Notification);

const readPermission = (): NotificationPermission | "unsupported" =>
  isSupported() ? Notification.permission : "unsupported";

/**
 * The Notifications API's permission state, plus `requestPermission()` and
 * a `notify()` helper. `notify()` does nothing (returns `undefined`) unless
 * permission is `"granted"`. There is no built-in event for permission
 * changes, so `permission` only updates after `requestPermission()`
 * resolves. Returns `"unsupported"` (the safe default for server
 * rendering) where the Notifications API doesn't exist.
 *
 * @example
 * ```tsx
 * const { permission, requestPermission, notify } = useNotificationPermission();
 * await requestPermission();
 * notify("Done!", { body: "Your export finished." });
 * ```
 */
export const useNotificationPermission = (): UseNotificationPermissionResult => {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    readPermission,
  );

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported()) {
      return "denied";
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notify = useCallback(
    (title: string, options?: NotificationOptions): Notification | undefined => {
      if (!isSupported() || Notification.permission !== "granted") {
        return undefined;
      }
      return new Notification(title, options);
    },
    [],
  );

  return { notify, permission, requestPermission };
};
