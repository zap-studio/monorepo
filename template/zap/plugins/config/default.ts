import { VERCEL } from "@/zap/env/runtime/public";
import type { DefaultConfig } from "../types/default.config";

export const DEFAULT_CONFIG = {
  ai: {
    SYSTEM_PROMPT: "You are a helpful assistant.",
  },
  analytics: {
    ENABLE_POSTHOG: false,
    ENABLE_VERCEL_ANALYTICS: VERCEL,
    ENABLE_VERCEL_SPEED_INSIGHTS: VERCEL,
  },
  auth: {
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
  },
  blog: {
    BASE_PATH: "/blog",
    DATA_DIR: "zap/blog/data",
    MAX_BLOG_POSTS_IN_FOOTER: 3,
  },
} as const satisfies DefaultConfig;
