import "server-only";

import { eq } from "drizzle-orm";
import type webpush from "web-push";

import { getUserIdService } from "@/zap/auth/services";
import { db } from "@/zap/db/providers/drizzle";
import { PUBLIC_ENV } from "@/zap/env/public";
import { SERVER_ENV } from "@/zap/env/server";
import { PushNotificationError } from "@/zap/errors";

import { pushNotifications } from "../db/providers/drizzle/schema";
import { ZAP_PWA_CONFIG } from "../zap.plugin.config";

let webpushInstance: typeof import("web-push") | null = null;

export async function getWebPushService() {
  if (webpushInstance) {
    return webpushInstance;
  }

  if (
    !(
      PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      SERVER_ENV.VAPID_PRIVATE_KEY &&
      ZAP_PWA_CONFIG.VAPID_MAIL
    )
  ) {
    throw new PushNotificationError(
      "Web Push service is not properly configured. Please check your VAPID keys and email settings."
    );
  }

  const webpushModule = await import("web-push");

  webpushModule.default.setVapidDetails(
    `mailto:${ZAP_PWA_CONFIG.VAPID_MAIL}`,
    PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    SERVER_ENV.VAPID_PRIVATE_KEY
  );

  webpushInstance = webpushModule.default;
  return webpushInstance;
}

type SubscribeUserService = {
  subscription: webpush.PushSubscription;
};

export async function subscribeUserToPushNotificationsService({
  subscription,
}: SubscribeUserService) {
  await getWebPushService();

  const userId = await getUserIdService();

  await db
    .insert(pushNotifications)
    .values({
      subscription,
      userId,
    })
    .onConflictDoUpdate({
      target: [pushNotifications.userId],
      set: {
        subscription,
      },
    });

  return { message: "User subscribed successfully" };
}

export async function unsubscribeUserFromPushNotificationsService() {
  const userId = await getUserIdService();

  await db
    .delete(pushNotifications)
    .where(eq(pushNotifications.userId, userId))
    .execute();

  return { message: "User unsubscribed successfully" };
}
