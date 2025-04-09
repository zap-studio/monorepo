import "./globals.css";

import type { Metadata } from "next";
import { Geist as Font } from "next/font/google";
import Providers from "@/providers/providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FLAGS } from "@/data/flags";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

const font = Font({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zap.ts",
  description: "The boilerplate to build application as fast as a zap.",
};

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
          {FLAGS.VERCEL.ANALYTICS_ENABLED && <Analytics />}
          {FLAGS.VERCEL.SPEED_INSIGHTS_ENABLED && <SpeedInsights />}
        </Providers>
      </body>
    </html>
  );
}
