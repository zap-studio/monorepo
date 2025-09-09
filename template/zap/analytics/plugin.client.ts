import type { IntegrationsMap, ZapClientPlugin } from "@/zap/plugins/types";
import type { AnalyticsClientPluginConfig } from "@/zap/plugins/types/analytics.plugin";
import { AnalyticsProvider } from "./providers/analytics.provider";

export function analyticsClientPlugin(
  config?: Partial<AnalyticsClientPluginConfig>
): ZapClientPlugin<
  "analytics",
  AnalyticsClientPluginConfig,
  IntegrationsMap,
  { AnalyticsProvider: typeof AnalyticsProvider }
> {
  return {
    id: "analytics",
    config,
    providers: {
      AnalyticsProvider,
    },
  } satisfies ZapClientPlugin<"analytics">;
}
