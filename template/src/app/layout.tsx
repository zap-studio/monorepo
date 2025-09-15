import "./globals.css";

import type { Metadata } from "next";
import { geist } from "@/app/fonts";
import { Toaster } from "@/components/ui/sonner";
import { getServerPlugin } from "@/lib/zap.server";
import { Providers } from "@/providers/providers";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analytics = getServerPlugin("analytics");
  const analyticsConfig = analytics?.config ?? {};
  const VercelProvider = analytics?.providers?.VercelProvider;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <Providers>
          {children}

          <Toaster position="top-center" />
          {VercelProvider && (
            <VercelProvider pluginConfigs={{ analytics: analyticsConfig }} />
          )}
        </Providers>
      </body>
    </html>
  );
}
