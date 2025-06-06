"use client";

import { $fetch } from "@/lib/fetch";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";
import { urlBase64ToUint8Array } from "@/zap/lib/pwa/pwa";

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
    try {
      usePushNotificationsStore.setState({ isSubscribed: true });

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      usePushNotificationsStore.setState({ subscription: sub });

      const serializedSub = sub.toJSON();
      await subscribeTrigger({ subscription: serializedSub });
    } catch {
      usePushNotificationsStore.setState({
        subscription: null,
        isSubscribed: false,
      });
      toast.error("Failed to subscribe to push notifications");
    }
  };

  const unsubscribeFromPush = async () => {
    const { subscription } = store;
    if (!subscription) return;

    try {
      usePushNotificationsStore.setState({
        subscription: null,
        isSubscribed: false,
      });
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
