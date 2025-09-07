import type { ZapClientPlugin } from "@/zap/plugins/types";
import type { AnalyticsClientPluginConfig } from "@/zap/plugins/types/analytics.plugin";

export function analyticsClientPlugin(
  config?: Partial<AnalyticsClientPluginConfig>
) {
  return {
    id: "analytics",
    config,
  } satisfies ZapClientPlugin;
}
