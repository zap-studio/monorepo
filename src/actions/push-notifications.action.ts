"use server";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import webpush from "web-push";
import { z } from "zod";
import { getUserId } from "./authenticated.action";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const subscribeUserSchema = z.object({
  subscription: z.object({
    endpoint: z.string(),
    keys: z.object({
      auth: z.string(),
      p256dh: z.string(),
    }),
  }),
});

export async function subscribeUser(sub: PushSubscription) {
  const validatedParams = subscribeUserSchema.parse({
    subscription: sub,
  });

  try {
    const userId = await getUserId();

    await db.insert(pushNotifications).values({
      subscription: validatedParams.subscription,
      userId,
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function unsubscribeUser() {
  try {
    const userId = await getUserId();

    await db
      .delete(pushNotifications)
      .where(eq(pushNotifications.userId, userId));
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
