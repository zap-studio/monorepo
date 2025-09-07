import type { ZapServerPlugin } from "@/zap/plugins/types";
import type { AnalyticsServerPluginConfig } from "../plugins/types/analytics.plugin";

export function analyticsPlugin(config?: Partial<AnalyticsServerPluginConfig>) {
  return {
    id: "analytics",
    config,
  } satisfies ZapServerPlugin;
}
