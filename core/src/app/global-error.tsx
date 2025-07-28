"use client";
import "client-only";
import "./globals.css";

import { ZapButton } from "@/components/zap-ui/button";
import { geist } from "@/fonts";

interface ErrorBoundaryProps {
  reset: () => void;
}

export default function GlobalError({ reset }: ErrorBoundaryProps) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <div className="flex min-h-screen items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="w-full space-y-6 text-center">
            <div className="space-y-3">
              <h1 className="text-primary animate-bounce text-4xl font-bold tracking-tighter sm:text-5xl">
                500
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred.
              </p>
            </div>
            <ZapButton onClick={() => reset()} variant={"ghost"}>
              Try again
            </ZapButton>
          </div>
        </div>
      </body>
    </html>
  );
}
