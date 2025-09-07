import "server-only";

import { analyticsPlugin } from "@/zap/analytics/plugin.server";
import { blogPlugin } from "@/zap/blog/plugin.server";
import { VERCEL } from "@/zap/env/runtime/public";
import { zap } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapServerClient = zap([
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

export function getServerPlugin(pluginId: keyof typeof zapServerClient) {
  return zapServerClient[pluginId];
}
