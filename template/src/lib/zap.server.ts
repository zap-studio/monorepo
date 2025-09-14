import "server-only";

import { aiPlugin } from "@/zap/ai/plugin.server";
import { analyticsPlugin } from "@/zap/analytics/plugin.server";
import { authPlugin } from "@/zap/auth/plugin.server";
import { blogPlugin } from "@/zap/blog/plugin.server";
import { zap } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapServerClient = zap([
  aiPlugin(),
  analyticsPlugin(),
  authPlugin(),
  blogPlugin(),
] as const);

export type ZapServerClient = typeof zapServerClient;

export function getServerPlugin<TPlugin extends keyof ZapServerClient>(
  pluginId: TPlugin
): ZapServerClient[TPlugin] {
  return zapServerClient[pluginId];
}
