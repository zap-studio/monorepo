import { VERCEL } from "@/zap/env/runtime";

import { AnalyticsPluginConfig } from "./zap.plugin.config.types";

export const ZAP_ANALYTICS_CONFIG: AnalyticsPluginConfig = {
  ENABLE_POSTHOG: false,
  ENABLE_VERCEL_ANALYTICS: VERCEL,
  ENABLE_VERCEL_SPEED_INSIGHTS: VERCEL,
};
