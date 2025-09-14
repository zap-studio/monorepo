import "client-only";

import { analyticsClientPlugin } from "@/zap/analytics/plugin.client";
import { authClientPlugin } from "@/zap/auth/plugin.client";
import { blogClientPlugin } from "@/zap/blog/plugin.client";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
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

export function getClientPluginConfig<TPlugin extends keyof ZapClient>(
  pluginId: TPlugin
): ZapClient[TPlugin]["config"] {
  const plugin = getClientPlugin(pluginId);
  return plugin?.config ?? DEFAULT_CONFIG[pluginId];
}

export type ZapClientPluginInstance<TPlugin extends keyof ZapClient> =
  ZapClient[TPlugin];

export function isClientPluginEnabled<TPlugin extends keyof ZapClient>(
  pluginId: TPlugin
): boolean {
  const plugin = getClientPlugin(pluginId);
  return !!plugin?.config;
}
