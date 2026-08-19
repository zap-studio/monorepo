import { useCallback, useState } from "react";

export interface UseNotificationPermissionResult {
  notify: (title: string, options?: NotificationOptions) => Notification | undefined;
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<NotificationPermission>;
}

const isSupported = (): boolean => typeof window !== "undefined" && "Notification" in window;

const readPermission = (): NotificationPermission | "unsupported" =>
  isSupported() ? Notification.permission : "unsupported";

/**
 * The Notifications API's permission state, plus `requestPermission()` and
 * a `notify()` helper that no-ops (returns `undefined`) unless permission is
 * `"granted"`. There's no native "permission changed" event, so `permission`
 * only updates when `requestPermission()` resolves. `"unsupported"` — the
 * SSR-safe default — where the Notifications API doesn't exist.
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
