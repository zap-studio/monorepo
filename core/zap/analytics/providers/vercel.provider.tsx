import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { getServerPlugin } from "@/lib/zap.server";
import { VERCEL } from "@/zap/env/runtime/public";
import type { ZapServerPlugin } from "@/zap/plugins/types";
import type { AnalyticsServerPluginConfig } from "@/zap/plugins/types/analytics.plugin";

export function VercelProvider() {
  const analytics: ZapServerPlugin<AnalyticsServerPluginConfig> =
    getServerPlugin("analytics");

  const enableVercelAnalytics =
    VERCEL && !!analytics?.config?.ENABLE_VERCEL_ANALYTICS;
  const enableVercelSpeedInsights =
    VERCEL && !!analytics?.config?.ENABLE_VERCEL_SPEED_INSIGHTS;

  return (
    <>
      {enableVercelAnalytics && <Analytics />}
      {enableVercelSpeedInsights && <SpeedInsights />}
    </>
  );
}
