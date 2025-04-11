import { SETTINGS } from "@/data/settings";
import type { MetadataRoute } from "next";

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
