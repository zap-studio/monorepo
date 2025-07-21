import "../zap/lib/orpc/server";
import "./globals.css";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { VERCEL } from "@/lib/env.client";
import { FLAGS } from "@/lib/flags";
import { font } from "@/lib/font";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";
import Providers from "@/zap/providers/providers";

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [
    Analytics,
    SpeedInsights,
    ENABLE_ANALYTICS,
    ENABLE_SPEED_INSIGHTS,
    ENABLE_POSTHOG,
  ] = await Promise.all([
    VERCEL
      ? import("@vercel/analytics/react").then((mod) => mod.Analytics)
      : Promise.resolve(null),
    VERCEL
      ? import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights)
      : Promise.resolve(null),
    FLAGS.VERCEL_ENABLE_ANALYTICS(),
    FLAGS.VERCEL_ENABLE_SPEED_INSIGHTS(),
    FLAGS.POSTHOG_ENABLE_ANALYTICS(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <Providers ENABLE_POSTHOG={ENABLE_POSTHOG}>
          {children}

          <Toaster />
          {ENABLE_ANALYTICS && Analytics && <Analytics />}
          {ENABLE_SPEED_INSIGHTS && SpeedInsights && <SpeedInsights />}
        </Providers>
      </body>
    </html>
  );
}
