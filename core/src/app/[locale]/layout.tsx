import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist as Font } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { Toaster } from "@/components/ui/sonner";
import { FLAGS } from "@/data/flags";
import { routing } from "@/i18n/routing";
import { generateZapMetadata } from "@/zap.config";
import Providers from "@/zap/providers/providers";

const font = Font({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return generateZapMetadata(locale, (key: string) => {
    return t(key);
  });
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <Providers nextIntl={{ locale }}>
          {children}

          <Toaster />
          {FLAGS.VERCEL.ENABLE_ANALYTICS && <Analytics />}
          {FLAGS.VERCEL.ENABLE_SPEED_INSIGHTS && <SpeedInsights />}
        </Providers>
      </body>
    </html>
  );
}
