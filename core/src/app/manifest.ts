import type { MetadataRoute } from "next";

import { ZAP_CONFIG } from "@/zap.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ZAP_CONFIG.PWA.NAME,
    short_name: ZAP_CONFIG.PWA.SHORT_NAME,
    description: ZAP_CONFIG.PWA.DESCRIPTION,
    start_url: ZAP_CONFIG.PWA.START_URL,
    display: "standalone",
    background_color: ZAP_CONFIG.PWA.BACKGROUND_COLOR,
    theme_color: ZAP_CONFIG.PWA.THEME_COLOR,
    icons: ZAP_CONFIG.PWA.ICONS,
  };
}
