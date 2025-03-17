"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";

interface PushNotificationsStore {
  isSupported: boolean;
  subscription: PushSubscription | null;
  message: string;
  isIOS: boolean;
  isStandalone: boolean;
  isSubscribed: boolean;
  setMessage: (message: string) => void;
  initialize: () => void;
}

export const usePushNotificationsStore = create<PushNotificationsStore>()(
  persist(
    (set) => ({
      isSupported: false,
      subscription: null,
      message: "",
      isIOS: false,
      isStandalone: false,
      isSubscribed: false,

      setMessage: (message) => set({ message }),

      initialize: () => {
        if (typeof window === "undefined" || typeof navigator === "undefined")
          return;

        const isSupported =
          "serviceWorker" in navigator && "PushManager" in window;
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !(window as any).MSStream;
        const isStandalone = window.matchMedia(
          "(display-mode: standalone)",
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
    { name: "push-notifications" },
  ),
);

export const usePushNotificationsInitializer = () => {
  const { initialize } = usePushNotificationsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);
};
