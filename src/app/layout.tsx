import "./globals.css";

import type { Metadata } from "next";
import { Poppins as Font } from "next/font/google";
import Providers from "@/providers/providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
