"use server";
import "server-only";

import { Effect } from "effect";
import type webpush from "web-push";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getWebPushAction } from "@/zap/actions/push-notifications/get-web-push.action";
import { client } from "@/zap/lib/orpc/client";

interface SubscribeUserActionProps {
  input: {
    subscription: webpush.PushSubscription;
  };
}

export async function subscribeUserAction({ input }: SubscribeUserActionProps) {
  const effect = Effect.gen(function* (_) {
    const subscription = input.subscription;

    yield* _(
      Effect.tryPromise({
        try: () => getWebPushAction(),
        catch: () => new Error("Failed to get web push"),
      }),
    );

    const userId = yield* _(
      Effect.tryPromise({
        try: () => client.auth.getUserId(),
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

    return { success: true };
  });

  return await Effect.runPromise(effect);
}
