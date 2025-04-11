const IS_VERCEL = process.env.VERCEL === "1";

// ZAP:TODO configure the flag and add your own
export const FLAGS = {
  VERCEL: {
    ENABLE_ANALYTICS: IS_VERCEL,
    ENABLE_SPEED_INSIGHTS: IS_VERCEL,
  },
  ENABLE_SOCIAL_PROVIDER: true,
  REQUIRE_EMAIL_VERIFICATION: true,
  ENABLE_POSTHOG: true,
};
