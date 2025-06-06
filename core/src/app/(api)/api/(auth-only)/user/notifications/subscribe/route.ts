import { auth } from "@/zap/lib/auth/server";
import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export async function POST(req: Request) {
  try {
    // Get current user
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const { subscription } = subscribeSchema.parse(body);

    // Check if user already has a subscription
    const existingSubscription = await db.query.pushNotifications.findFirst({
      where: eq(pushNotifications.userId, session.user.id),
    });

    if (existingSubscription) {
      // Update existing subscription
      await db
        .update(pushNotifications)
        .set({ subscription })
        .where(eq(pushNotifications.userId, session.user.id));

      return NextResponse.json({
        success: true,
        subscriptionId: existingSubscription.id,
      });
    }

    // Create new subscription
    const [newSubscription] = await db
      .insert(pushNotifications)
      .values({
        userId: session.user.id,
        subscription,
      })
      .returning();

    return NextResponse.json({
      success: true,
      subscriptionId: newSubscription.id,
    });
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid subscription data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
