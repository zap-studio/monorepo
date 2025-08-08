import "server-only";

import type webpush from "web-push";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getUserIdService } from "@/zap/services/auth/get-user-id.service";
import { getWebPushService } from "@/zap/services/push-notifications/get-web-push.service";

interface SubscribeUserService {
  subscription: webpush.PushSubscription;
}

export async function subscribeUserService({
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
