import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { VERCEL } from "@/zap/env/runtime/public";
import type { AnalyticsServerPluginConfig } from "@/zap/plugins/types/analytics.plugin";

export function VercelProvider({
  config,
}: {
  config: Partial<AnalyticsServerPluginConfig>;
}) {
  const enableVercelAnalytics = VERCEL && !!config.ENABLE_VERCEL_ANALYTICS;
  const enableVercelSpeedInsights =
    VERCEL && !!config.ENABLE_VERCEL_SPEED_INSIGHTS;

  return (
    <>
      {enableVercelAnalytics && <Analytics />}
      {enableVercelSpeedInsights && <SpeedInsights />}
    </>
  );
}
