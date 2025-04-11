import "./globals.css";

import type { Metadata } from "next";
import { Geist as Font } from "next/font/google";
import Providers from "@/zap/providers/providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FLAGS } from "@/data/flags";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";

const font = Font({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <Providers>
          <NextTopLoader
            color="#3B82F6"
            showSpinner={false}
            easing="ease"
            height={3}
          />

          {children}

          <Toaster />
          {FLAGS.VERCEL.ENABLE_ANALYTICS && <Analytics />}
          {FLAGS.VERCEL.ENABLE_SPEED_INSIGHTS && <SpeedInsights />}
        </Providers>
      </body>
    </html>
  );
}
