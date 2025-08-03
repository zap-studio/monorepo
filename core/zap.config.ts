/**
 * ZAP:TODO
 * - Change the current config file to your own configuration
 * - Check `public/sw.js` file and change the URL in the `clients.openWindow` function
 * - Check `next-sitemap.config.js` and change the `siteUrl` to your own URL (e.g. `https://yourdomain.com`)
 * - Change `social-provider-button.tsx` to customize icon for each auth provider
 * - Configure and customize flags in `src/zap/lib/flags/flags.ts` and `src/lib/flags.ts`
 * - Change the blog directory in `src/zap/lib/blog/utils.ts` (if you want to use a different directory)
 * - Change the legal directory in `src/zap/lib/legal/utils.ts` (if you want to use a different directory)
 * - Customize open graph image generation in `src/app/opengraph-image/route.tsx`
 */

import type { Metadata } from "next";

import { CLIENT_ENV, DEV, VERCEL } from "@/lib/env.client";
import type { ZapSettings } from "@/zap/types/zap.config.types";

// ─────────────────────────────────────────────────────────────
// Core App Info
// ─────────────────────────────────────────────────────────────
export const NAME = "Zap.ts";
export const APP_NAME = `${NAME} | Build applications as fast as a zap`;
export const APP_DESCRIPTION =
  "Zap.ts is a Next.js boilerplate designed to help you build applications faster using a modern set of tools.";
export const BASE_URL = DEV
  ? "http://localhost:3000"
  : "https://demo.zap-ts.alexandretrotel.org";
export const SUPPORT_EMAIL = "your-email@example.com";

export type Provider = "github" | "google";

// ─────────────────────────────────────────────────────────────
// Product Metadata
// ─────────────────────────────────────────────────────────────
export type RecurringInterval = "month" | "year" | "one-time";
export type Currency = "usd" | "eur";

export type ProductMetadata = {
  productId: string;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  currency: Currency;
  recurringInterval: RecurringInterval;
  popular?: boolean;
  features?: string[];
};

const FEATURES = [
  "Unlimited projects",
  "Unlimited users",
  "Priority support",
  "Access to all features",
  "Early access to new features",
];

const PRODUCT_IDS = {
  sandbox: {
    monthly: "cd396dd5-b6ea-461c-a8de-e97539749480",
    yearly: "d07e65a0-9798-42c8-8f32-eca20d1be230",
  },
  production: {
    monthly: "6e21c61f-b711-4ce5-b925-e4a20871074c",
    yearly: "ad7d7325-3d72-42e5-8164-d4706c513468",
  },
};

export const PRODUCTS_METADATA: Record<string, ProductMetadata> = {
  free: {
    productId: "",
    slug: "free",
    name: "Free",
    description: "Free plan with limited features",
    price: 0,
    currency: "usd",
    recurringInterval: "one-time",
    features: [
      "Limited projects",
      "Limited users",
      "Community support",
      "Access to basic features",
    ],
  },
  "pro-monthly": {
    productId: PRODUCT_IDS[CLIENT_ENV.POLAR_ENV].monthly,
    slug: "pro-monthly",
    name: "Pro (Monthly)",
    description: "Monthly subscription for Pro features",
    price: 20,
    currency: "usd",
    recurringInterval: "month",
    features: FEATURES,
  },
  "pro-yearly": {
    productId: PRODUCT_IDS[CLIENT_ENV.POLAR_ENV].yearly,
    slug: "pro-yearly",
    name: "Pro (Yearly)",
    description: "Yearly subscription for Pro features",
    price: 192, // 20% discount applied
    currency: "usd",
    recurringInterval: "year",
    popular: true,
    features: FEATURES,
  },
  enterprise: {
    productId: "",
    slug: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    price: "Contact us",
    currency: "usd",
    recurringInterval: "one-time",
    features: [
      "Custom projects",
      "Custom users",
      "Dedicated support",
      "Access to all features",
      "Custom SLAs",
      "Custom integrations",
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Default Settings
// ─────────────────────────────────────────────────────────────
export const ZAP_DEFAULT_SETTINGS: ZapSettings = {
  AI: {
    SYSTEM_PROMPT: "You are a helpful assistant.",
  },
  ANALYTICS: {
    ENABLE_POSTHOG: false,
    ENABLE_VERCEL_ANALYTICS: VERCEL,
    ENABLE_VERCEL_SPEED_INSIGHTS: VERCEL,
  },
  AUTH: {
    REQUIRE_MAIL_VERIFICATION: true,
    ENABLE_SOCIAL_PROVIDER: true,
    MINIMUM_USERNAME_LENGTH: 3,
    MAXIMUM_USERNAME_LENGTH: 20,
    MINIMUM_PASSWORD_LENGTH: 8,
    MAXIMUM_PASSWORD_LENGTH: 128,
    LOGIN_URL: "/login",
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
      "/waitlist",
      "/_vercel/speed-insights/vitals",
      "/_vercel/insights/view",
      "/opengraph-image",
    ],
    VERIFIED_EMAIL_PATH: "/mail-verified",
  },
  BLOG: {
    BASE_PATH: "/blog",
  },
  MAIL: {
    PREFIX: NAME,
    RATE_LIMIT_SECONDS: 60,
    FROM: `${NAME} <${CLIENT_ENV.ZAP_MAIL}>`,
  },
  NOTIFICATIONS: {
    VAPID_MAIL: CLIENT_ENV.ZAP_MAIL,
  },
  PAYMENTS: {
    POLAR: {
      AUTHENTICATED_USERS_ONLY: true,
      CREATE_CUSTOMER_ON_SIGNUP: true,
      ENVIRONMENT: CLIENT_ENV.POLAR_ENV,
      PRODUCTS: Object.values(PRODUCT_IDS[CLIENT_ENV.POLAR_ENV]).map(
        (id, idx) => ({
          productId: id,
          slug: idx === 0 ? "pro-monthly" : "pro-yearly",
        }),
      ),
      SUCCESS_URL: "/app/billing/success",
    },
  },
  PWA: {
    NAME,
    SHORT_NAME: NAME,
    DESCRIPTION: APP_DESCRIPTION,
    START_URL: "/",
    BACKGROUND_COLOR: "#ffffff",
    THEME_COLOR: "#000000",
    ICONS: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  SECURITY: {
    CSP: {
      DEFAULT_SRC: ["'self'"],
      SCRIPT_SRC: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      STYLE_SRC: ["'self'", "'unsafe-inline'"],
      IMG_SRC: [
        "'self'",
        "blob:",
        "data:",
        "https://www.gravatar.com",
        "https://*.googleusercontent.com",
      ],
      FONT_SRC: ["'self'"],
      OBJECT_SRC: ["'none'"],
      BASE_URI: ["'self'"],
      FORM_ACTION: ["'self'"],
      FRAME_ANCESTORS: ["'none'"],
      FRAME_SRC: ["'self'", "https://www.youtube.com"],
      BLOCK_ALL_MIXED_CONTENT: false,
      UPGRADE_INSECURE_REQUESTS: true,
    },
    PERMISSIONS_POLICY: {
      CAMERA: ["self"],
      GEOLOCATION: ["self"],
      MICROPHONE: ["self"],
      PAYMENT: ["self"],
      DISPLAY_CAPTURE: ["self"],
      FULLSCREEN: ["self"],
      PICTURE_IN_PICTURE: ["self"],
      AUTOPLAY: ["self"],
      ENCRYPTED_MEDIA: ["self"],
      WEB_SHARE: ["self"],
      ACCELEROMETER: ["self"],
      GYROSCOPE: ["self"],
      MAGNETOMETER: ["self"],
      SCREEN_WAKE_LOCK: ["self"],
      GAMEPAD: [],
      HID: [],
      IDLE_DETECTION: [],
      LOCAL_FONTS: [],
      MIDI: [],
      BLUETOOTH: [],
      SERIAL: [],
      XR_SPATIAL_TRACKING: [],
      CROSS_ORIGIN_ISOLATED: [],
      PUBLICKEY_CREDENTIALS_GET: [],
      USB: [],
    },
  },
  WAITLIST: {
    ENABLE_WAITLIST_PAGE: false,
    TITLE: "try Zap.ts",
    DESCRIPTION: "be the first to build applications as fast as a zap.",
    SHOW_COUNT: true,
  },
};

// ─────────────────────────────────────────────────────────────
// Default Metadata (SEO / OG)
// ─────────────────────────────────────────────────────────────
export const ZAP_DEFAULT_METADATA: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  category: "technology",
  generator: "Next.js",
  applicationName: APP_NAME,
  referrer: "origin-when-cross-origin",
  keywords: [
    "Zap.ts",
    "typescript",
    "nextjs",
    "react",
    "boilerplate",
    "template",
    "web",
    "application",
  ],
  authors: [
    { name: "Alexandre Trotel", url: "https://www.alexandretrotel.org" },
  ],
  creator: "Alexandre Trotel",
  publisher: "Alexandre Trotel",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: BASE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} Open Graph Image`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    creator: "@alexandretrotel",
    images: [`${BASE_URL}/opengraph-image`],
  },
  appleWebApp: {
    title: APP_NAME,
    statusBarStyle: "black-translucent",
    capable: true,
  },
  appLinks: {
    web: {
      url: BASE_URL,
      should_fallback: true,
    },
  },
};
