import type * as webpush from "web-push";

import { ApplicationError } from "@/zap/errors";

const BASE64_PAD_LENGTH = 4;

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat(
    (BASE64_PAD_LENGTH - (base64String.length % BASE64_PAD_LENGTH)) %
      BASE64_PAD_LENGTH
  );
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";

  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}

export function subscriptionToWebPushSubscription(
  subscription: PushSubscription
): webpush.PushSubscription {
  const p256dh = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  if (!(p256dh && auth)) {
    throw new ApplicationError("Invalid PushSubscription object");
  }

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(p256dh),
      auth: arrayBufferToBase64(auth),
    },
  };
}
