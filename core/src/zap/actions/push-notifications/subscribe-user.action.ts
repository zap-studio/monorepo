"use server";
import "server-only";

import { Effect } from "effect";

import { SETTINGS } from "@/data/settings";
import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { ENV } from "@/lib/env";
import { getUserId } from "@/zap/actions/auth/authenticated.action";
import { SubscribeUserSchema } from "@/zap/schemas/push-notifications.schema";

let webpushInstance: typeof import("web-push") | null = null;

export async function getWebPush() {
  if (webpushInstance) {
    return webpushInstance;
  }

  if (
    !ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    !ENV.VAPID_PRIVATE_KEY ||
    !SETTINGS.NOTIFICATIONS.VAPID_MAIL
  ) {
    throw new Error(
      "VAPID configuration is incomplete. Push notifications are not available.",
    );
  }

  const webpush = await import("web-push");

  webpush.default.setVapidDetails(
    `mailto:${SETTINGS.NOTIFICATIONS.VAPID_MAIL}`,
    ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    ENV.VAPID_PRIVATE_KEY,
  );

  webpushInstance = webpush.default;
  return webpushInstance;
}

export const subscribeUser = async (sub: PushSubscription) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      yield* _(
        Effect.tryPromise({
          try: () => getWebPush(),
          catch: (e) => e,
        }),
      );

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
