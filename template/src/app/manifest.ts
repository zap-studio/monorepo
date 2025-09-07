import type { MetadataRoute } from "next";

import { ZAP_PWA_CONFIG } from "@/zap/pwa/zap.plugin.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ZAP_PWA_CONFIG.NAME,
    short_name: ZAP_PWA_CONFIG.SHORT_NAME,
    description: ZAP_PWA_CONFIG.DESCRIPTION,
    start_url: ZAP_PWA_CONFIG.START_URL,
    display: "standalone",
    background_color: ZAP_PWA_CONFIG.BACKGROUND_COLOR,
    theme_color: ZAP_PWA_CONFIG.THEME_COLOR,
    icons: ZAP_PWA_CONFIG.ICONS,
  };
}
