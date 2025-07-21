"use client";
import "client-only";
import "./globals.css";

import { ZapButton } from "@/components/zap-ui/button";
import { font } from "@/lib/font";

interface ErrorBoundaryProps {
  reset: () => void;
}

export default function GlobalError({ reset }: ErrorBoundaryProps) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>
        <div className="flex min-h-screen items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="w-full space-y-6 text-center">
            <div className="space-y-3">
              <p className="text-foreground">Something went wrong!</p>
            </div>
            <ZapButton onClick={() => reset()} type="button">
              Try again
            </ZapButton>
          </div>
        </div>
      </body>
    </html>
  );
}
