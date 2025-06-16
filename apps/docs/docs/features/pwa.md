# Progressive Web App (PWA)

**Zap.ts** comes with built-in support for **Progressive Web Apps (PWA)**, allowing your app to _work offline_, _send push notifications_, and provide a _native-like experience_ on any device.

## Overview

- **Offline Support:** Users can access your app even without an internet connection.
- **Installable:** Users can install your app to their home screen or desktop.
- **Push Notifications:** Real-time notifications delivered via the browser's Push API and service worker.
- **Performance:** Faster load times and improved reliability with caching strategies.
- **Customizable:** Easily update icons, theme color, and manifest settings.

## How it works?

### 1. Service Worker

A service worker (`public/sw.js`) is registered automatically to _handle caching_, _offline support_, and _push notifications_.

### 2. Manifest

The PWA manifest (`public/manifest.json`) defines your app's name, icons, theme color, and how it appears when installed.

> **Note:** The `manifest.json` is generated automatically at build time from your settings, so you don't need to edit it manually.

You can configure it in `zap.config.ts`.

```ts
// zap.config.ts
import { ZapSettings } from "@/zap/types/zap.config.types";
import { Metadata } from "next";

export const APP_NAME = "Zap.ts";
export const APP_DESCRIPTION =
    "Build application as fast as a zap.";
export const BASE_URL = DEV
    ? "http://localhost:3000"
    : "https://demo.zap-ts.alexandretrotel.org";

export const ZAP_DEFAULT_SETTINGS: ZapSettings = {
    // Other settings...
    PWA: {
        NAME: APP_NAME,
        SHORT_NAME: APP_NAME,
        DESCRIPTION: APP_DESCRIPTION,
        START_URL: "/",
        BACKGROUND_COLOR: "#ffffff",
        THEME_COLOR: "#000000",
        ICONS: [
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    },
};
```

### 3. Push Notifications

**Zap.ts** integrates push notifications using the browser Push API and the service worker.  
See [Notifications & Emails](/docs/features/notifications.md) for details on subscribing users and handling push events.

### 4. Customizing Your PWA

- **Update icons:** Replace the icon files in `public/`.
- **Edit manifest:** Change `PWA` settings to update app name, colors, and icons.
- **Extend service worker:** Add caching strategies or custom logic in `sw.js`.

## References

### `sw.js`

This is the service worker responsible for handling push notifications and can be extended for offline caching and other PWA features.

```js
// public/sw.js
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(
    clients.openWindow("https://demo.zap-ts.alexandretrotel.org"),
  ); // Make sure the URL matches your app's URL
});
```

---

### `manifest`

This function generates your PWA manifest dynamically from your settings.

```ts
// src/app/manifest.ts
import type { MetadataRoute } from "next";

import { SETTINGS } from "@/data/settings";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SETTINGS.PWA.NAME,
    short_name: SETTINGS.PWA.SHORT_NAME,
    description: SETTINGS.PWA.DESCRIPTION,
    start_url: SETTINGS.PWA.START_URL,
    display: "standalone",
    background_color: SETTINGS.PWA.BACKGROUND_COLOR,
    theme_color: SETTINGS.PWA.THEME_COLOR,
    icons: SETTINGS.PWA.ICONS,
  };
}
```