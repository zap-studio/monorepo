import "server-only";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { getPushNotificationsByUserQuery } from "@/zap/db/queries/push-notifications.query";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { auth } from "@/zap/lib/auth/server";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    let subscription;
    try {
      subscription = subscribeSchema.parse(body).subscription;
    } catch {
      return NextResponse.json(
        { message: "Invalid subscription data" },
        { status: 400 },
      );
    }

    let existingSubscription;
    try {
      existingSubscription = await getPushNotificationsByUserQuery.execute({
        userId,
      });
    } catch {
      existingSubscription = null;
    }

    if (existingSubscription) {
      try {
        await db
          .update(pushNotifications)
          .set({ subscription })
          .where(eq(pushNotifications.userId, userId))
          .execute();
      } catch {
        // Continue silently
      }

      return NextResponse.json({
        success: true,
        subscriptionId: existingSubscription.id,
      });
    }

    let newSubscriptionArr: (typeof pushNotifications.$inferSelect)[] = [];
    try {
      newSubscriptionArr = await db
        .insert(pushNotifications)
        .values({
          userId,
          subscription,
        })
        .returning()
        .execute();
    } catch {
      newSubscriptionArr = [];
    }

    const newSubscription = newSubscriptionArr[0];

    return NextResponse.json({
      success: true,
      subscriptionId: newSubscription?.id,
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid subscription data"
        : "Internal server error";
    const status = error instanceof z.ZodError ? 400 : 500;

    return NextResponse.json({ message }, { status });
  }
}
