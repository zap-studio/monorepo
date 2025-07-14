"use client";
import "client-only";

import { useEffect } from "react";

import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";

export function usePwa() {
  const initialize = usePushNotificationsStore((state) => state.initialize);
  useEffect(() => initialize(), [initialize]);
}
