import "client-only";

import { analyticsClientPlugin } from "@/zap/analytics/plugin.client";
import { toClient } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapClient = toClient([
  analyticsClientPlugin({
    ENABLE_POSTHOG: false,
  }),
]);

export type ZapClient = typeof zapClient;

export function getClientPlugin<TPlugin extends keyof ZapClient>(
  pluginId: TPlugin
): ZapClient[TPlugin] {
  return zapClient[pluginId];
}
