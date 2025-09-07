import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { Metadata } from "next";

import { geist } from "@/app/fonts";
import { Toaster } from "@/components/ui/sonner";
import { zapServerClient } from "@/lib/zap.server";
import { Providers } from "@/providers/providers";
import { VERCEL } from "@/zap/env/runtime/public";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const enableVercelAnalytics =
    VERCEL && zapServerClient.analytics?.config?.ENABLE_VERCEL_ANALYTICS;
  const enableVercelSpeedInsights =
    VERCEL && zapServerClient.analytics?.config?.ENABLE_VERCEL_SPEED_INSIGHTS;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <Providers>
          {children}

          <Toaster position="top-center" />
          {enableVercelAnalytics && <Analytics />}
          {enableVercelSpeedInsights && <SpeedInsights />}
        </Providers>
      </body>
    </html>
  );
}
