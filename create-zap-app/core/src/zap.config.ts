// ZAP:TODO: Change the current config file

export const IS_VERCEL = process.env.VERCEL === "1";
export const DEV = process.env.NODE_ENV === "development";

export const APP_NAME = "Zap.ts";
export const BASE_URL = DEV
  ? "http://localhost:3000"
  : "https://demo.zap-ts.alexandretrotel.org";

export const ZAP_DEFAULT_FLAGS = {
  VERCEL: {
    ENABLE_ANALYTICS: IS_VERCEL,
    ENABLE_SPEED_INSIGHTS: IS_VERCEL,
  },
  ENABLE_POSTHOG: true,
};

export const ZAP_DEFAULT_SETTINGS = {
  AUTH: {
    REQUIRE_EMAIL_VERIFICATION: true,
    ENABLE_SOCIAL_PROVIDER: true,
    MINIMUM_USERNAME_LENGTH: 3,
    MAXIMUM_USERNAME_LENGTH: 20,
    MINIMUM_PASSWORD_LENGTH: 8,
    MAXIMUM_PASSWORD_LENGTH: 128,
  },
  MAIL: {
    PREFIX: APP_NAME,
    RATE_LIMIT_SECONDS: 60,
  },
};
