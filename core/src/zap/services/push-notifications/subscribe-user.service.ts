import "server-only";

import { Effect } from "effect";
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
  const effect = Effect.gen(function* (_) {
    const subscription = input.subscription;

    yield* _(
      Effect.tryPromise({
        try: () => getWebPushService(),
        catch: () => new Error("Failed to get web push"),
      }),
    );

    const userId = yield* _(
      Effect.tryPromise({
        try: () => getUserIdService(),
        catch: () => new Error("Failed to get user ID"),
      }),
    );

    yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .insert(pushNotifications)
            .values({
              subscription,
              userId,
            })
            .execute(),
        catch: () => new Error("Failed to subscribe user"),
      }),
    );

    return { success: true, message: "User subscribed successfully" };
  });

  return await Effect.runPromise(effect);
}
