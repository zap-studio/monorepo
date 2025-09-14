import "client-only";

import { analyticsClientPlugin } from "@/zap/analytics/plugin.client";
import { authClientPlugin } from "@/zap/auth/plugin.client";
import { blogClientPlugin } from "@/zap/blog/plugin.client";
import { zap } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapClient = zap([
  analyticsClientPlugin(),
  authClientPlugin({}),
  blogClientPlugin(),
] as const);

export type ZapClient = typeof zapClient;

export function getClientPlugin<TPlugin extends keyof ZapClient>(
  pluginId: TPlugin
): ZapClient[TPlugin] {
  return zapClient[pluginId];
}
