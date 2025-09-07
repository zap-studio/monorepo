import type { ZapClientPlugin } from "@/zap/plugins/types";
import type { AnalyticsClientPluginConfig } from "@/zap/plugins/types/analytics.plugin";
import { AnalyticsProvider } from "./providers/analytics.provider";

export function analyticsClientPlugin(
  config?: Partial<AnalyticsClientPluginConfig>
) {
  return {
    id: "analytics",
    config,
    providers: {
      AnalyticsProvider,
    },
  } satisfies ZapClientPlugin;
}
