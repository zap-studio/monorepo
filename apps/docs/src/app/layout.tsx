import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata, Viewport } from "next";
import "./global.css";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.zapstudio.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zap Studio – The higher layer for modern apps",
    template: "%s | Zap Studio",
  },
  description:
    "Framework-agnostic TypeScript packages for the features every app needs. Type-safe, tested, zero lock-in.",
  keywords: [
    "TypeScript",
    "packages",
    "fetch",
    "validation",
    "authorization",
    "permit",
    "Standard Schema",
    "open source",
    "zap studio",
  ],
  authors: [{ name: "Alexandre Trotel", url: siteUrl }],
  creator: "Alexandre Trotel",
  publisher: "Zap Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Zap Studio",
    title: "Zap Studio – The higher layer for modern apps",
    description:
      "Framework-agnostic TypeScript packages for the features every app needs. Type-safe, tested, zero lock-in.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Zap Studio – The higher layer for modern apps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zap Studio – The higher layer for modern apps",
    description:
      "Framework-agnostic TypeScript packages for the features every app needs. Type-safe, tested, zero lock-in.",
    images: ["/og.png"],
    creator: "@zapstudio",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
