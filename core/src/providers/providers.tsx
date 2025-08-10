"use client";
import "client-only";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@/providers/theme.provider";
import { AnalyticsProvider } from "@/zap/analytics/providers/analytics.provider";
import { TanStackQueryProvider } from "@/zap/api/providers/tanstack-query.provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <ProgressProvider
        color="#efb100"
        height="3px"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <NuqsAdapter>
          <TanStackQueryProvider>
            <AnalyticsProvider>{children}</AnalyticsProvider>
          </TanStackQueryProvider>
        </NuqsAdapter>
      </ProgressProvider>
    </ThemeProvider>
  );
}
