import "server-only";

import type webpush from "web-push";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getUserIdService } from "@/zap/services/auth/get-user-id.service";
import { getWebPushService } from "@/zap/services/push-notifications/get-web-push.service";

interface SubscribeUserServiceProps {
  input: {
    subscription: webpush.PushSubscription;
  };
}

export async function subscribeUserService({
  input,
}: SubscribeUserServiceProps) {
  const subscription = input.subscription;

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
