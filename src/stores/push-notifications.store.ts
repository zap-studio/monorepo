import { create } from "zustand";
import {
  subscribeUser,
  unsubscribeUser,
} from "@/actions/push-notifications.action";
import { urlBase64ToUint8Array } from "@/lib/utils";

interface PushNotificationState {
  isSupported: boolean;
  subscription: PushSubscription | null;
  initialize: () => Promise<void>;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
}

export const usePushNotificationStore = create<PushNotificationState>(
  (set) => ({
    isSupported: false,
    subscription: null,

    initialize: async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        set({ isSupported: true });
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        const sub = await registration.pushManager.getSubscription();
        set({ subscription: sub });
      }
    },

    subscribeToPush: async () => {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      set({ subscription: sub });
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
    },

    unsubscribeFromPush: async () => {
      const { subscription } = usePushNotificationStore.getState();
      await subscription?.unsubscribe();
      set({ subscription: null });
      await unsubscribeUser();
    },
  }),
);
