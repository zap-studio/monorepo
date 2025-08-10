import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  try {
    const { ZAP_PWA_CONFIG } = await import("@/zap/pwa/zap.plugin.config");

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
  } catch {
    // Fail silently, it just means PWA plugin is not installed
    return {};
  }
}
