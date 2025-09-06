import { PUBLIC_ENV } from "@/zap/env/public";
import { APP_DESCRIPTION, NAME } from "@/zap.config";

import type { PWAPluginConfig } from "./zap.plugin.config.types.js";

export const ZAP_PWA_CONFIG: PWAPluginConfig = {
  NAME,
  SHORT_NAME: NAME,
  DESCRIPTION: APP_DESCRIPTION,
  START_URL: "/",
  BACKGROUND_COLOR: "#ffffff",
  THEME_COLOR: "#000000",
  ICONS: [
    { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  VAPID_MAIL: PUBLIC_ENV.ZAP_MAIL,
};
