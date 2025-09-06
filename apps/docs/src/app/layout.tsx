import "@/app/global.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist as Font } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ALEXANDRE_TROTEL_WEBSITE_URL, BASE_URL } from "@/data/website";
import { Provider } from "./provider";

const font = Font({
  subsets: ["latin"],
});

const APP_NAME = "Zap.ts";
const APP_DESCRIPTION = "Build applications as fast as a zap.";

export const metadata: Metadata = {
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
  authors: [{ name: "Alexandre Trotel", url: ALEXANDRE_TROTEL_WEBSITE_URL }],
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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${font.className} antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>
          {children}
          <Analytics />
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
