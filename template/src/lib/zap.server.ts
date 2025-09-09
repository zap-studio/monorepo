import "server-only";

import { aiPlugin } from "@/zap/ai/plugin.server";
import { analyticsPlugin } from "@/zap/analytics/plugin.server";
import { blogPlugin } from "@/zap/blog/plugin.server";
import { VERCEL } from "@/zap/env/runtime/public";
import { zap } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapServerClient = zap([
  aiPlugin({
    SYSTEM_PROMPT: "You are a helpful assistant.",
  }),
  analyticsPlugin({
    ENABLE_VERCEL_ANALYTICS: VERCEL,
    ENABLE_VERCEL_SPEED_INSIGHTS: VERCEL,
  }),
  blogPlugin({
    BASE_PATH: "/blog",
    DATA_DIR: "zap/blog/data",
    MAX_BLOG_POSTS_IN_FOOTER: 3,
  }),
] as const);

export type ZapServerClient = typeof zapServerClient;

export function getServerPlugin<TPlugin extends keyof ZapServerClient>(
  pluginId: TPlugin
): ZapServerClient[TPlugin] {
  return zapServerClient[pluginId];
}
