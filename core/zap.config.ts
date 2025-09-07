/**
 * ZAP Core Configuration
 *
 * This file contains only the core application configuration.
 * Plugin-specific configurations are located in their respective
 * zap/{plugin}/zap.plugin.config.ts files.
 *
 * ZAP:TODO
 * - Change the core configuration to your own setup
 * - Check `next-sitemap.config.js` and change the `siteUrl` to your own URL
 * - Customize open graph image generation in `src/app/opengraph-image/route.tsx`
 * - Check `public/sw.js` file and change the URL in the `clients.openWindow` function
 */

import type { Metadata } from "next";
import { DEV } from "./zap/env/runtime/public";
import type { ZapCoreSettings, ZapPlugins } from "./zap.config.types";

// ─────────────────────────────────────────────────────────────
// Core App Info
// ─────────────────────────────────────────────────────────────
export const NAME = "Zap.ts";
export const APP_NAME = `${NAME} | Build applications as fast as a zap`;
export const APP_DESCRIPTION =
  "Zap.ts is a Next.js boilerplate designed to help you build applications faster using a modern set of tools.";
export const BASE_URL = DEV
  ? "http://localhost:3000"
  : "https://demo.zap-ts.zapstudio.dev";
export const SALES_EMAIL = "sales@example.com";
export const SUPPORT_EMAIL = "support@example.com";

// ─────────────────────────────────────────────────────────────
// Plugin Configuration
// ─────────────────────────────────────────────────────────────
export const PLUGIN_CONFIG: Record<ZapPlugins, boolean> = {
  ai: true,
  analytics: true,
  api: true,
  auth: true,
  blog: true,
  components: true,
  crypto: true,
  db: true,
  docker: true,
  env: true,
  errors: true,
  feedbacks: true,
  flags: true,
  landing: true,
  legal: true,
  mails: true,
  markdown: true,
  payments: true,
  "package-json-scripts": true,
  plugins: true,
  pwa: true,
  seo: true,
  sidebar: true,
  waitlist: true,
};

// ─────────────────────────────────────────────────────────────
// Core Configuration
// ─────────────────────────────────────────────────────────────
export const ZAP_CORE_CONFIG: ZapCoreSettings = {
  APP: {
    NAME,
    APP_NAME,
    DESCRIPTION: APP_DESCRIPTION,
    BASE_URL,
    SALES_EMAIL,
    SUPPORT_EMAIL,
    APP_URL: "/app",
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
