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
import { DEV, ENV } from "@/lib/env.client";
import type { ZapSettings } from "@/zap/types/zap.config.types";

export const APP_NAME = "Zap.ts";
export const APP_DESCRIPTION = "Build applications as fast as a zap.";
export const BASE_URL = DEV
  ? "http://localhost:3000"
  : "https://demo.zap-ts.alexandretrotel.org";

export type Provider = "apple" | "google";

export const ZAP_DEFAULT_SETTINGS: ZapSettings = {
  AI: {
    SYSTEM_PROMPT: "You are a helpful assistant.",
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
    PROVIDERS: ["apple", "google"],
    PASSWORD_COMPROMISED_MESSAGE:
      "This password has been exposed in a data breach. Please choose a stronger, unique password.",
    PUBLIC_PATHS: [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/terms-of-service",
      "/privacy-policy",
      "/cookie-policy",
      "/_vercel/speed-insights/vitals",
      "/_vercel/insights/view",
      "/opengraph-image",
    ],
  },
  BLOG: {
    BASE_PATH: "/blog",
  },
  MAIL: {
    PREFIX: APP_NAME,
    RATE_LIMIT_SECONDS: 60,
    FROM: `${APP_NAME} <${ENV.ZAP_MAIL}>`,
  },
  NOTIFICATIONS: {
    VAPID_MAIL: ENV.ZAP_MAIL,
  },
  PWA: {
    NAME: APP_NAME,
    SHORT_NAME: APP_NAME,
    DESCRIPTION: APP_DESCRIPTION,
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
  SECURITY: {
    CSP: {
      DEFAULT_SRC: ["'self'"],
      SCRIPT_SRC: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      STYLE_SRC: ["'self'", "'unsafe-inline'"],
      IMG_SRC: ["'self'", "blob:", "data:"],
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
      // High-risk features - keep blocked or allow self-origin
      CAMERA: ["(self)"],
      MICROPHONE: ["(self)"],
      GEOLOCATION: ["(self)"],
      PAYMENT: ["(self)"],
      USB: ["()"],
      MIDI: ["()"],

      // Medium-risk features - allow self-origin
      FULLSCREEN: ["'self'"],
      PICTURE_IN_PICTURE: ["'self'"],
      DISPLAY_CAPTURE: ["(self)"],

      // Low-risk features - allow self-origin
      AUTOPLAY: ["'self'"],
      ENCRYPTED_MEDIA: ["'self'"],
      WEB_SHARE: ["'self'"],

      // Features that should generally be allowed
      ACCELEROMETER: ["'self'"],
      AMBIENT_LIGHT_SENSOR: ["'self'"],
      BATTERY: ["'self'"],
      GYROSCOPE: ["'self'"],
      MAGNETOMETER: ["'self'"],
      SCREEN_WAKE_LOCK: ["'self'"],

      // Security-focused features - keep restricted
      CROSS_ORIGIN_ISOLATED: ["()"],
      DOCUMENT_DOMAIN: ["()"],
      EXECUTION_WHILE_NOT_RENDERED: ["()"],
      EXECUTION_WHILE_OUT_OF_VIEWPORT: ["()"],
      KEYBOARD_MAP: ["()"],
      NAVIGATION_OVERRIDE: ["()"],
      PUBLICKEY_CREDENTIALS_GET: ["()"],
      SYNC_XHR: ["()"],
      XR_SPATIAL_TRACKING: ["()"],
    },
  },
  WAITLIST: {
    TITLE: "try Zap.ts",
    DESCRIPTION: "be the first to build applications as fast as a zap.",
    SHOW_COUNT: true,
  },
};

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
    {
      name: "Alexandre Trotel",
      url: "https://www.alexandretrotel.org",
    },
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
      url: "https://demo.zap-ts.alexandretrotel.org",
      should_fallback: true,
    },
  },
};
