import { urlBase64ToUint8Array } from "@/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";

interface PushNotificationContextType {
  isSupported: boolean;
  subscription: PushSubscription | null;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | null>(
  null,
);



interface PushSubscriptionProps {
  children: React.ReactNode;
}

export default function PushNotificationProvider({
  children,
}: PushSubscriptionProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  return (
    <PushNotificationContext.Provider
      value={{
        isSupported,
        subscription,
        subscribeToPush,
        unsubscribeFromPush,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
}

export const usePushNotifications = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error(
      "usePushNotifications must be used within a PushNotificationProvider",
    );
  }
  return context;
};