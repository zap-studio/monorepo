import { analyticsPlugin } from "@/zap/analytics/plugin.server";
import { VERCEL } from "@/zap/env/runtime/public";
import { toClient } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapServerClient = toClient([
  analyticsPlugin({
    ENABLE_VERCEL_ANALYTICS: VERCEL,
    ENABLE_VERCEL_SPEED_INSIGHTS: VERCEL,
  }),
]);

export type ZapServerClient = typeof zapServerClient;

export function getServerPlugin<TPlugin extends keyof ZapServerClient>(
  pluginId: TPlugin
): ZapServerClient[TPlugin] {
  return zapServerClient[pluginId];
}
