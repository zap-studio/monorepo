import "server-only";

import { aiPlugin } from "@/zap/ai/plugin.server";
import { analyticsPlugin } from "@/zap/analytics/plugin.server";
import { authPlugin } from "@/zap/auth/plugin.server";
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
  authPlugin({
    REQUIRE_MAIL_VERIFICATION: true,
    ENABLE_SOCIAL_PROVIDER: true,
    MINIMUM_USERNAME_LENGTH: 3,
    MAXIMUM_USERNAME_LENGTH: 20,
    MINIMUM_PASSWORD_LENGTH: 8,
    MAXIMUM_PASSWORD_LENGTH: 128,
    SIGN_UP_URL: "/register",
    LOGIN_URL: "/login",
    FORGOT_PASSWORD_URL: "/forgot-password",
    REDIRECT_URL_AFTER_SIGN_UP: "/login",
    REDIRECT_URL_AFTER_SIGN_IN: "/app",
    PROVIDERS: ["github", "google"],
    PASSWORD_COMPROMISED_MESSAGE:
      "This password has been exposed in a data breach. Please choose a stronger, unique password.",
    PUBLIC_PATHS: [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/mail-verified",
      "/reset-password",
      "/terms-of-service",
      "/privacy-policy",
      "/cookie-policy",
      "/blog",
      "/waitlist",
      "/_vercel/speed-insights/vitals",
      "/_vercel/insights/view",
      "/opengraph-image",
    ],
    VERIFIED_EMAIL_PATH: "/mail-verified",
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
