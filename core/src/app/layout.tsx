import "./globals.css";

import type { Metadata } from "next";

import { geist } from "@/app/fonts";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers/providers";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";
import { VERCEL } from "@/zap/env/runtime";

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

// Vercel Analytics (optional)
const VercelAnalytics = async () => {
  const { ZAP_ANALYTICS_CONFIG } = await import(
    "@/zap/analytics/zap.plugin.config"
  );
  if (!(VERCEL && ZAP_ANALYTICS_CONFIG.ENABLE_VERCEL_ANALYTICS)) {
    return null;
  }

  const { Analytics } = await import("@vercel/analytics/react");
  return <Analytics />;
};

// Vercel Speed Insights (optional)
const VercelSpeedInsights = async () => {
  const { ZAP_ANALYTICS_CONFIG } = await import(
    "@/zap/analytics/zap.plugin.config"
  );
  if (!(VERCEL && ZAP_ANALYTICS_CONFIG.ENABLE_VERCEL_SPEED_INSIGHTS)) {
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
        <Providers>
          {children}

          <Toaster position="top-center" />
          <VercelAnalytics />
          <VercelSpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
