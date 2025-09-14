import "server-only";

import { aiPlugin } from "@/zap/ai/plugin.server";
import { analyticsPlugin } from "@/zap/analytics/plugin.server";
import { authPlugin } from "@/zap/auth/plugin.server";
import { blogPlugin } from "@/zap/blog/plugin.server";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
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

export function getServerPluginConfig<TPlugin extends keyof ZapServerClient>(
  pluginId: TPlugin
): ZapServerClient[TPlugin]["config"] {
  const plugin = getServerPlugin(pluginId);
  return plugin?.config ?? DEFAULT_CONFIG[pluginId];
}

export type ZapServerPluginInstance<TPlugin extends keyof ZapServerClient> =
  ZapServerClient[TPlugin];

export function isServerPluginEnabled<TPlugin extends keyof ZapServerClient>(
  pluginId: TPlugin
): boolean {
  const plugin = getServerPlugin(pluginId);
  return !!plugin?.config;
}
