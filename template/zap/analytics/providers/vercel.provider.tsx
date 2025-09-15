import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { VERCEL } from "@/zap/env/runtime/public";
import type { AnalyticsServerPluginConfig } from "@/zap/plugins/types/analytics.plugin";

type VercelProviderProps = {
  pluginConfigs: { analytics: Partial<AnalyticsServerPluginConfig> };
};

export function VercelProvider({ pluginConfigs }: VercelProviderProps) {
  const enableVercelAnalytics =
    VERCEL && !!pluginConfigs.analytics.ENABLE_VERCEL_ANALYTICS;
  const enableVercelSpeedInsights =
    VERCEL && !!pluginConfigs.analytics.ENABLE_VERCEL_SPEED_INSIGHTS;

  return (
    <>
      {enableVercelAnalytics && <Analytics />}
      {enableVercelSpeedInsights && <SpeedInsights />}
    </>
  );
}
