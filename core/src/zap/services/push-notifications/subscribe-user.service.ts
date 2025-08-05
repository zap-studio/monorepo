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
  try {
    const subscription = input.subscription;

    try {
      await getWebPushService();
    } catch {
      throw new Error("Failed to get web push");
    }

    let userId;
    try {
      userId = await getUserIdService();
    } catch {
      throw new Error("Failed to get user ID");
    }

    try {
      await db
        .insert(pushNotifications)
        .values({
          subscription,
          userId,
        })
        .execute();
    } catch {
      throw new Error("Failed to subscribe user");
    }

    return { success: true, message: "User subscribed successfully" };
  } catch (error) {
    throw error;
  }
}
