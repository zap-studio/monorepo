"use client";
import "client-only";

import { PUBLIC_ENV } from "@/lib/env.public";
import { $fetch } from "@/lib/fetch";
import { handleClientError } from "@/zap/lib/api/client";
import { ClientError, EnvironmentError } from "@/zap/lib/api/errors";
import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { urlBase64ToUint8Array } from "@/zap/lib/pwa/utils";
import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";

interface SubscriptionResponse {
  success: boolean;
  subscriptionId: string;
}

interface UnsubscribeResponse {
  success: boolean;
}

export function usePushNotifications() {
  const subscription = usePushNotificationsStore((state) => state.subscription);
  const setSubscription = usePushNotificationsStore(
    (state) => state.setSubscription,
  );
  const setSubscribed = usePushNotificationsStore(
    (state) => state.setSubscribed,
  );
  const setSubscriptionState = usePushNotificationsStore(
    (state) => state.setSubscriptionState,
  );

  const { mutateAsync: subscribe, isPending: isSubscribing } = useZapMutation({
    mutationKey: ["/api/user/notifications/subscribe"],
    mutationFn: ({ subscription }: { subscription: PushSubscriptionJSON }) => {
      return $fetch<SubscriptionResponse>("/api/user/notifications/subscribe", {
        method: "POST",
        body: subscription,
      });
    },
    onError: async () => {
      if (subscription) {
        await subscription.unsubscribe();
      }
    },
    successMessage: "Subscribed to push notifications successfully!",
  });

  const { mutateAsync: unsubscribe, isPending: isUnsubscribing } =
    useZapMutation({
      mutationKey: ["/api/user/notifications/unsubscribe"],
      mutationFn: () => {
        return $fetch<UnsubscribeResponse>(
          "/api/user/notifications/unsubscribe",
          {
            method: "DELETE",
          },
        );
      },
      onSuccess: () => {
        setSubscriptionState({
          subscription: null,
          isSubscribed: false,
        });
      },
      successMessage: "We will miss you!",
    });

  const subscribeToPush = async () => {
    setSubscribed(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (!PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        throw new EnvironmentError("VAPID public key is not set");
      }

      const applicationServerKey = urlBase64ToUint8Array(
        PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      );

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const serializedSub = sub.toJSON();

      await subscribe({ subscription: serializedSub });
      setSubscription(sub);
    } catch (error) {
      handleClientError(error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (!subscription) {
        throw new ClientError("No active subscription found");
      }

      await subscription.unsubscribe();
      await unsubscribe();
    } catch (error) {
      handleClientError(error, "Failed to unsubscribe from push notifications");
    }
  };

  return {
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribing,
    isUnsubscribing,
  };
}
