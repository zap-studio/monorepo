import { VERCEL } from "@/zap/env/runtime/public";
import type { AnalyticsPluginConfig } from "@/zap/plugins/types/analytics.plugin";

export const ZAP_ANALYTICS_CONFIG: AnalyticsPluginConfig = {
  ENABLE_POSTHOG: false,
  ENABLE_VERCEL_ANALYTICS: VERCEL,
  ENABLE_VERCEL_SPEED_INSIGHTS: VERCEL,
};
