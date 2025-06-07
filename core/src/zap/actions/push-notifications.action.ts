"use server";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import webpush from "web-push";
import { getUserId } from "@/zap/actions/authenticated.action";
import { SubscribeUserSchema } from "@/zap/schemas/push-notifications.schema";
import { SETTINGS } from "@/data/settings";
import { Effect } from "effect";

webpush.setVapidDetails(
  `mailto:${SETTINGS.NOTIFICATIONS.VAPID_MAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export const subscribeUser = async (sub: PushSubscription) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const validatedParams = SubscribeUserSchema.parse({
        subscription: sub,
      });

      const userId = yield* _(
        Effect.tryPromise({
          try: () => getUserId(),
          catch: (e) => e,
        }),
      );

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .insert(pushNotifications)
              .values({
                subscription: validatedParams.subscription,
                userId,
              })
              .execute(),
          catch: (e) => e,
        }),
      );

      return { success: true };
    }),
  );
};

export const unsubscribeUser = async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = yield* _(
        Effect.tryPromise({
          try: () => getUserId(),
          catch: (e) => e,
        }),
      );

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .delete(pushNotifications)
              .where(eq(pushNotifications.userId, userId))
              .execute(),
          catch: (e) => e,
        }),
      );

      return { success: true };
    }),
  );
};
