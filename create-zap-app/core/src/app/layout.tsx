import "./globals.css";

import type { Metadata } from "next";
import { Poppins as Font } from "next/font/google";
import Providers from "@/providers/providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FLAGS } from "@/data/flags";
import { Toaster } from "@/components/ui/sonner";

const font = Font({
  weight: ["400", "500", "600", "700"],
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
          {children}

          <Toaster />
          {FLAGS.VERCEL.ANALYTICS_ENABLED && <Analytics />}
          {FLAGS.VERCEL.SPEED_INSIGHTS_ENABLED && <SpeedInsights />}
        </Providers>
      </body>
    </html>
  );
}
