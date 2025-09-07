"use client";
import "client-only";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const IOS_REGEX = /iPad|iPhone|iPod/;

type PushNotificationsStoreState = {
  isSupported: boolean;
  subscription: PushSubscription | null;
  message: string;
  isIOS: boolean;
  isStandalone: boolean;
  isSubscribed: boolean;
};

type PushNotificationsStoreActions = {
  setMessage: (message: string) => void;
  setSubscribed: (isSubscribed: boolean) => void;
  setSubscription: (subscription: PushSubscription | null) => void;
  setSubscriptionState: ({
    subscription,
    isSubscribed,
  }: {
    subscription: PushSubscription | null;
    isSubscribed: boolean;
  }) => void;
  initialize: () => void;
};

export const usePushNotificationsStore = create<
  PushNotificationsStoreState & PushNotificationsStoreActions
>()(
  persist(
    (set) => ({
      isSupported: false,
      subscription: null,
      message: "",
      isIOS: false,
      isStandalone: false,
      isSubscribed: false,

      setMessage: (message) => set({ message }),

      setSubscribed: (isSubscribed) => set({ isSubscribed }),

      setSubscription: (subscription) => set({ subscription }),

      setSubscriptionState: ({ subscription, isSubscribed }) =>
        set({ subscription, isSubscribed }),

      initialize: () => {
        if (typeof window === "undefined" || typeof navigator === "undefined") {
          return;
        }

        const isSupported =
          "serviceWorker" in navigator && "PushManager" in window;
        const isIOS =
          IOS_REGEX.test(navigator.userAgent) &&
          !(window as Window & { MSStream?: unknown }).MSStream;
        const isStandalone = window.matchMedia(
          "(display-mode: standalone)"
        ).matches;

        set({ isSupported, isIOS, isStandalone });

        if (isSupported) {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/", updateViaCache: "none" })
            .then(async (registration) => {
              const sub = await registration.pushManager.getSubscription();
              set({ subscription: sub, isSubscribed: !!sub });
            });
        }
      },
    }),
    { name: "push-notifications" }
  )
);

export function usePushNotificationsInitializer() {
  const initialize = usePushNotificationsStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);
}
