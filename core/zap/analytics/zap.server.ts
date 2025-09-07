import type { ZapServerPlugin } from "@/zap/plugins/types";
import { ZAP_ANALYTICS_CONFIG } from "./zap.plugin.config";

export function analyticsPlugin() {
  return {
    id: "analytics",
    config: ZAP_ANALYTICS_CONFIG,
  } satisfies ZapServerPlugin;
}
