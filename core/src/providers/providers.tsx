"use client";
import "client-only";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { isPluginEnabled } from "@/lib/plugins";
import { ThemeProvider } from "@/providers/theme.provider";
import { AnalyticsProvider } from "@/zap/analytics/providers/analytics.provider";
import { TanStackQueryProvider } from "@/zap/api/providers";

interface ProvidersProps {
  children: React.ReactNode;
}

const withTanStackQuery = (children: React.ReactNode) =>
  isPluginEnabled("api") ? (
    <TanStackQueryProvider>{children}</TanStackQueryProvider>
  ) : (
    children
  );

const withAnalytics = (children: React.ReactNode) =>
  isPluginEnabled("analytics") ? (
    <AnalyticsProvider>{children}</AnalyticsProvider>
  ) : (
    children
  );

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
        <NuqsAdapter>{withTanStackQuery(withAnalytics(children))}</NuqsAdapter>
      </ProgressProvider>
    </ThemeProvider>
  );
}
