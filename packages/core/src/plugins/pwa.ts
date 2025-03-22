"use client";

import { usePushNotificationsStore } from "@/stores/push-notifications.store";
import { useEffect } from "react";

export const usePwa = () => {
  const initialize = usePushNotificationsStore((state) => state.initialize);
  useEffect(() => initialize(), [initialize]);
};
