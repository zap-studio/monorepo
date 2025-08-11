"use client";
import "client-only";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { lazy } from "react";

import { ThemeProvider } from "@/providers/theme.provider";
import { TanStackQueryProvider } from "@/zap/api/providers/tanstack-query.provider";

// Lazy load optional providers
const AnalyticsProvider = lazy(() =>
  import("@/zap/analytics/providers/analytics.provider")
    .then((module) => ({ default: module.AnalyticsProvider }))
    .catch(() => ({
      default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    })),
);

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
