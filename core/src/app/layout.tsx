import "../zap/lib/orpc/server";
import "./globals.css";

import type { Metadata } from "next";
import { Geist as Font } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { FLAGS } from "@/data/flags";
import { VERCEL } from "@/lib/env.client";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";
import Providers from "@/zap/providers/providers";

const font = Font({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const Analytics = VERCEL
    ? (await import("@vercel/analytics/react")).Analytics
    : null;
  const SpeedInsights = VERCEL
    ? (await import("@vercel/speed-insights/next")).SpeedInsights
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <Providers>
          {children}

          <Toaster />
          {FLAGS.VERCEL.ENABLE_ANALYTICS && Analytics && <Analytics />}
          {FLAGS.VERCEL.ENABLE_SPEED_INSIGHTS && SpeedInsights && (
            <SpeedInsights />
          )}
        </Providers>
      </body>
    </html>
  );
}
