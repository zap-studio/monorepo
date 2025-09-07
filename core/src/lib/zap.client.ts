import { analyticsClientPlugin } from "@/zap/analytics/zap.client";
import { toClient } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapClient = toClient([analyticsClientPlugin()]);

export type ZapClient = typeof zapClient;

export function getClientPlugin<TPlugin extends keyof ZapClient>(
  pluginId: TPlugin
): ZapClient[TPlugin] | undefined {
  return zapClient[pluginId] ?? undefined;
}
