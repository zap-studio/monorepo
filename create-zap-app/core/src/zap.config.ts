// ZAP:TODO - Change the current config file to your own configuration
export const IS_VERCEL = process.env.VERCEL_ENV ? true : false;
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
    REDIRECT_URL_AFTER_SIGN_UP: "/login",
    REDIRECT_URL_AFTER_SIGN_IN: "/app",
  },
  NOTIFICATIONS: {
    VAPID_MAIL: "hello@mail.alexandretrotel.org",
  },
  MAIL: {
    PREFIX: APP_NAME,
    RATE_LIMIT_SECONDS: 60,
  },
  PWA: {
    NAME: APP_NAME,
    SHORT_NAME: APP_NAME,
    DESCRIPTION: "The boilerplate to build application as fast as a zap.",
    START_URL: "/",
    BACKGROUND_COLOR: "#ffffff",
    THEME_COLOR: "#000000",
    ICONS: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};
