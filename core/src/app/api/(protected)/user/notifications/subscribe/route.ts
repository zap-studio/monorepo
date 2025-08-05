import "server-only";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { getPushNotificationsByUserQuery } from "@/zap/db/queries/push-notifications.query";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { auth } from "@/zap/lib/auth/server";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { subscription } = subscribeSchema.parse(body);

  const existingSubscription = await getPushNotificationsByUserQuery
    .execute({
      userId,
    })
    .catch(() => null);

  if (existingSubscription) {
    await db
      .update(pushNotifications)
      .set({ subscription })
      .where(eq(pushNotifications.userId, userId))
      .execute()
      .catch(() => {
        // Continue silently if update fails
      });

    return NextResponse.json({
      success: true,
      subscriptionId: existingSubscription.id,
    });
  }

  const newSubscriptionArr = await db
    .insert(pushNotifications)
    .values({
      userId,
      subscription,
    })
    .returning()
    .execute()
    .catch(() => []);

  const newSubscription = newSubscriptionArr[0];

  return NextResponse.json({
    success: true,
    subscriptionId: newSubscription?.id,
  });
});
