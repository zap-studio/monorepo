"use client";
import "client-only";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { SWRConfig } from "swr";

import { PUBLIC_ENV } from "@/lib/env.public";
import { ThemeProvider } from "@/providers/theme.provider";
import SuspendedPostHogPageView from "@/zap/components/analytics/posthog-page-view";

interface ProvidersProps {
  children: React.ReactNode;
  ENABLE_POSTHOG: boolean;
}

export default function Providers({
  children,
  ENABLE_POSTHOG,
}: ProvidersProps) {
  useEffect(() => {
    if (!ENABLE_POSTHOG) {
      return;
    }

    posthog.init(PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host: PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_HOST || "",
      capture_pageview: false, // Disable automatic pageview tracking
      capture_pageleave: true, // Enable automatic pageleave tracking
    });
  }, [ENABLE_POSTHOG]);

  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <NuqsAdapter>
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
            {ENABLE_POSTHOG && (
              <PHProvider client={posthog}>
                <SuspendedPostHogPageView />
                {children}
              </PHProvider>
            )}
            {!ENABLE_POSTHOG && children}
          </ProgressProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </SWRConfig>
  );
}
