import "./globals.css";

import type { Metadata } from "next";
import type { JSX } from "react";
import { geist } from "@/app/fonts";
import { Toaster } from "@/components/ui/sonner";
import { getServerPlugin } from "@/lib/zap.server";
import { Providers } from "@/providers/providers";
import type { ZapServerPlugin } from "@/zap/plugins/types";
import type { AnalyticsServerPluginConfig } from "@/zap/plugins/types/analytics.plugin";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analytics: ZapServerPlugin<
    AnalyticsServerPluginConfig,
    Record<string, unknown>,
    { VercelProvider: () => JSX.Element }
  > = getServerPlugin("analytics");
  const VercelProvider = analytics?.providers?.VercelProvider;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <Providers>
          {children}

          <Toaster position="top-center" />
          {VercelProvider && <VercelProvider />}
        </Providers>
      </body>
    </html>
  );
}
