import "./globals.css";

import type { Metadata } from "next";

import { geist } from "@/app/fonts";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers/providers";
import { ZAP_DEFAULT_METADATA, ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { VERCEL } from "@/zap/env/runtime";

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

const VercelAnalytics = async () => {
  if (!(VERCEL && ZAP_DEFAULT_SETTINGS.ANALYTICS.ENABLE_VERCEL_ANALYTICS)) {
    return null;
  }

  const { Analytics } = await import("@vercel/analytics/react");
  return <Analytics />;
};

const VercelSpeedInsights = async () => {
  if (
    !(VERCEL && ZAP_DEFAULT_SETTINGS.ANALYTICS.ENABLE_VERCEL_SPEED_INSIGHTS)
  ) {
    return null;
  }

  const { SpeedInsights } = await import("@vercel/speed-insights/react");
  return <SpeedInsights />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <Providers
          ENABLE_POSTHOG={ZAP_DEFAULT_SETTINGS.ANALYTICS.ENABLE_POSTHOG}
        >
          {children}

          <Toaster position="top-center" />
          <VercelAnalytics />
          <VercelSpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
