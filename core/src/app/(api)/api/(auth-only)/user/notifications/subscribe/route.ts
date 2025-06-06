import { auth } from "@/zap/lib/auth/server";
import { db } from "@/db";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { Effect } from "effect";

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
  return Effect.runPromise(
    Effect.gen(function* (_) {
      // Get current user
      const session = yield* _(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: req.headers }),
          catch: () => null,
        }),
      );
      if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      // Validate request body
      const body = yield* _(
        Effect.tryPromise({
          try: () => req.json(),
          catch: () => new Error("Invalid JSON body"),
        }),
      );
      const subscriptionResult = yield* _(
        Effect.try({
          try: () => subscribeSchema.parse(body).subscription,
          catch: () => new Error("Invalid subscription data"),
        }).pipe(Effect.either),
      );
      if (subscriptionResult._tag === "Left") {
        return NextResponse.json(
          { message: "Invalid subscription data" },
          { status: 400 },
        );
      }
      const subscription = subscriptionResult.right;
      // Check if user already has a subscription
      const existingSubscription = yield* _(
        Effect.tryPromise({
          try: () =>
            db.query.pushNotifications.findFirst({
              where: eq(pushNotifications.userId, session.user.id),
            }),
          catch: () => null,
        }),
      );
      if (existingSubscription) {
        // Update existing subscription
        yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .update(pushNotifications)
                .set({ subscription })
                .where(eq(pushNotifications.userId, session.user.id)),
            catch: () => null,
          }),
        );
        return NextResponse.json({
          success: true,
          subscriptionId: existingSubscription.id,
        });
      }
      // Create new subscription
      const newSubscriptionArr = yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .insert(pushNotifications)
              .values({
                userId: session.user.id,
                subscription,
              })
              .returning(),
          catch: () => [],
        }),
      );
      const newSubscription = newSubscriptionArr[0];
      return NextResponse.json({
        success: true,
        subscriptionId: newSubscription?.id,
      });
    }).pipe(
      Effect.catchAll((err) =>
        Effect.succeed(
          NextResponse.json(
            {
              message:
                err instanceof z.ZodError
                  ? "Invalid subscription data"
                  : "Internal server error",
            },
            { status: err instanceof z.ZodError ? 400 : 500 },
          ),
        ),
      ),
    ),
  );
}
