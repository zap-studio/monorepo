"use client";
import "client-only";

import { PUBLIC_ENV } from "@/lib/env.public";
import { handleClientError } from "@/zap/lib/api/client";
import { ClientError, EnvironmentError } from "@/zap/lib/api/errors";
import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { orpc } from "@/zap/lib/orpc/client";
import {
  arrayBufferToBase64,
  urlBase64ToUint8Array,
} from "@/zap/lib/pwa/utils";
import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";

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
    ...orpc.pushNotifications.subscribeUser.mutationOptions(),
    onError: async () => {
      if (subscription) {
        await subscription.unsubscribe();
      }
    },
    successMessage: "Subscribed to push notifications successfully!",
  });

  const { mutateAsync: unsubscribe, isPending: isUnsubscribing } =
    useZapMutation({
      ...orpc.pushNotifications.unsubscribeUser.mutationOptions(),
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

      const authKey = sub.getKey("auth");
      const p256dhKey = sub.getKey("p256dh");

      if (!(authKey && p256dhKey)) {
        throw new ClientError("Failed to retrieve push subscription keys");
      }

      const transformedSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: arrayBufferToBase64(authKey),
          p256dh: arrayBufferToBase64(p256dhKey),
        },
      };

      await subscribe({ subscription: transformedSubscription });
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
      await unsubscribe({});
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
