"use client";

import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { usePushNotificationsStore } from "@/stores/push-notifications.store";
import { urlBase64ToUint8Array } from "@/lib/utils";

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

export function usePushNotification() {
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
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(arg),
        }).then((res) => {
          if (!res.ok) throw { message: "Subscription API failed" };
          return res.json();
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
        fetch(url, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }).then((res) => {
          if (!res.ok) throw { message: "Unsubscribe API failed" };
          return res.json();
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
