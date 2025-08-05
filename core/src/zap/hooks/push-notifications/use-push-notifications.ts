"use client";
import "client-only";

import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import { PUBLIC_ENV } from "@/lib/env.public";
import { $fetch } from "@/lib/fetch";
import { urlBase64ToUint8Array } from "@/zap/lib/pwa/utils";
import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";

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
        }),
      {
        optimisticData: { success: true, subscriptionId: "temp-id" },
        rollbackOnError: true,
        populateCache: (result) => result,
        onSuccess: () => {
          toast.success("Subscribed to notifications!");
        },
        onError: async (error) => {
          if (subscription) {
            try {
              await subscription.unsubscribe();
            } finally {
              setSubscriptionState({
                subscription: null,
                isSubscribed: false,
              });
            }
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
        }),
      {
        optimisticData: { success: true },
        rollbackOnError: false,
        populateCache: (result) => result,
        onSuccess: () => {
          toast.success("We will miss you!");
        },
        onError: () => {
          toast.error("Failed to unsubscribe from notifications.");
        },
      },
    );

  const subscribeToPush = async () => {
    setSubscribed(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (!PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        throw new Error("VAPID public key is not set");
      }

      const applicationServerKey = urlBase64ToUint8Array(
        PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      );

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      setSubscription(sub);

      const serializedSub = sub.toJSON();

      await subscribeTrigger({ subscription: serializedSub });
    } catch (error) {
      const message =
        (error instanceof Error && error.message) || "An error occurred";

      if (message.includes("ServiceWorker")) {
        toast.error("Service worker not ready");
      } else if (message.includes("VAPID")) {
        toast.error(message);
      } else {
        toast.error("Failed to subscribe to push notifications");
      }

      setSubscriptionState({
        subscription: null,
        isSubscribed: false,
      });
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) {
      return;
    }

    setSubscriptionState({
      subscription: null,
      isSubscribed: false,
    });

    try {
      await subscription.unsubscribe();
      await unsubscribeTrigger();
    } catch {
      toast.error("Failed to unsubscribe from push notifications");
    }
  };

  return {
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribing,
    isUnsubscribing,
  };
}
