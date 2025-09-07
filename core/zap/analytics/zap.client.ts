import type { ZapClientPlugin } from "@/zap/plugins/types";
import { ZAP_ANALYTICS_CONFIG } from "./zap.plugin.config";

export function analyticsClientPlugin() {
  return {
    id: "analytics",
    config: ZAP_ANALYTICS_CONFIG,
  } satisfies ZapClientPlugin;
}
