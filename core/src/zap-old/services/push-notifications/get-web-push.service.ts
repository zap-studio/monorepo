import "server-only";

import { SETTINGS } from "@/data/settings";
import { PUBLIC_ENV } from "@/zap/env/public";
import { SERVER_ENV } from "@/zap/env/server";
import { PushNotificationError } from "@/zap/lib/api/errors";

let webpushInstance: typeof import("web-push") | null = null;

export async function getWebPushService() {
  if (webpushInstance) {
    return webpushInstance;
  }

  if (
    !(
      PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      SERVER_ENV.VAPID_PRIVATE_KEY &&
      SETTINGS.NOTIFICATIONS.VAPID_MAIL
    )
  ) {
    throw new PushNotificationError(
      "Web Push service is not properly configured. Please check your VAPID keys and email settings.",
    );
  }

  const webpush = await import("web-push");

  webpush.default.setVapidDetails(
    `mailto:${SETTINGS.NOTIFICATIONS.VAPID_MAIL}`,
    PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    SERVER_ENV.VAPID_PRIVATE_KEY,
  );

  webpushInstance = webpush.default;
  return webpushInstance;
}
