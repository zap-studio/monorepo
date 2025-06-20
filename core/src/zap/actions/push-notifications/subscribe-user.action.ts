"use server";
import "server-only";

import { Effect } from "effect";
import webpush from "web-push";

import { SETTINGS } from "@/data/settings";
import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getUserId } from "@/zap/actions/auth/authenticated.action";
import { SubscribeUserSchema } from "@/zap/schemas/push-notifications.schema";

webpush.setVapidDetails(
  `mailto:${SETTINGS.NOTIFICATIONS.VAPID_MAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || "",
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
