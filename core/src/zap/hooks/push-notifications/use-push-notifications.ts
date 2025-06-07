"use client";

import { $fetch } from "@/lib/fetch";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";
import { urlBase64ToUint8Array } from "@/zap/lib/pwa/pwa";
import { Effect } from "effect";

interface SubscriptionResponse {
  success: boolean;
  subscriptionId: string;
}

interface UnsubscribeResponse {
  success: boolean;
}

interface ApiError {
  message: string;
}

export function usePushNotifications() {
  const store = usePushNotificationsStore();

  const { trigger: subscribeTrigger, isMutating: isSubscribing } =
    useSWRMutation<
      SubscriptionResponse,
      ApiError,
      string,
      { subscription: PushSubscriptionJSON }
    >(
      "/api/user/notifications/subscribe",
      (url: string, { arg }: { arg: { subscription: PushSubscriptionJSON } }) =>
        $fetch<SubscriptionResponse>(url, {
          method: "POST",
          body: arg,
        }).catch(() => {
          throw { message: "Subscription API failed" };
        }),
      {
        optimisticData: { success: true, subscriptionId: "temp-id" },
        rollbackOnError: true,
        populateCache: (result) => result,
        onSuccess: () => {
          toast.success(`Subscribed to notifications!`);
        },
        onError: (error) => {
          if (store.subscription) {
            store.subscription.unsubscribe().catch(() => {});
            usePushNotificationsStore.setState({
              subscription: null,
              isSubscribed: false,
            });
          }
          toast.error(`Failed to subscribe: ${error.message}`);
        },
      },
    );

  const { trigger: unsubscribeTrigger, isMutating: isUnsubscribing } =
    useSWRMutation<UnsubscribeResponse, ApiError, string>(
      "/api/user/notifications/unsubscribe",
      (url: string) =>
        $fetch<UnsubscribeResponse>(url, {
          method: "DELETE",
        }).catch(() => {
          throw { message: "Unsubscribe API failed" };
        }),
      {
        optimisticData: { success: true },
        rollbackOnError: false,
        populateCache: (result) => result,
        onSuccess: () => {
          toast.success("We will miss you!");
        },
        onError: () => {
          toast.error(`Failed to unsubscribe from notifications.`);
        },
      },
    );

  const subscribeToPush = async () => {
    await Effect.runPromise(
      Effect.gen(function* (_) {
        usePushNotificationsStore.setState({ isSubscribed: true });

        const registration = yield* _(
          Effect.tryPromise({
            try: () => navigator.serviceWorker.ready,
            catch: () => {
              throw new Error("Service worker not ready");
            },
          }),
        );

        const sub = yield* _(
          Effect.tryPromise({
            try: () =>
              registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
                ),
              }),
            catch: () => {
              throw new Error("Failed to subscribe to push manager");
            },
          }),
        );

        usePushNotificationsStore.setState({ subscription: sub });
        const serializedSub = sub.toJSON();

        yield* _(
          Effect.tryPromise({
            try: () => subscribeTrigger({ subscription: serializedSub }),
            catch: (e) => e,
          }),
        );
      }).pipe(
        Effect.catchAll(() =>
          Effect.sync(() => {
            usePushNotificationsStore.setState({
              subscription: null,
              isSubscribed: false,
            });
            toast.error("Failed to subscribe to push notifications");
          }),
        ),
      ),
    );
  };

  const unsubscribeFromPush = async () => {
    const { subscription } = store;
    if (!subscription) return;
    await Effect.runPromise(
      Effect.gen(function* (_) {
        usePushNotificationsStore.setState({
          subscription: null,
          isSubscribed: false,
        });

        yield* _(
          Effect.tryPromise({
            try: () => subscription.unsubscribe(),
            catch: () => {
              throw new Error("Failed to unsubscribe");
            },
          }),
        );

        yield* _(
          Effect.tryPromise({
            try: () => unsubscribeTrigger(),
            catch: () => {
              throw new Error("Failed to trigger unsubscribe");
            },
          }),
        );
      }).pipe(
        Effect.catchAll(() =>
          Effect.sync(() => {
            toast.error("Failed to unsubscribe from push notifications");
          }),
        ),
      ),
    );
  };

  return {
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribing,
    isUnsubscribing,
  };
}
