"use client";
import "client-only";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

import { ENV } from "@/lib/env.client";
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
    if (!ENABLE_POSTHOG) return;

    posthog.init(ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host: ENV.NEXT_PUBLIC_POSTHOG_HOST || "",
      capture_pageview: false, // Disable automatic pageview tracking
      capture_pageleave: true, // Enable automatic pageleave tracking
    });
  }, [ENABLE_POSTHOG]);

  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ProgressProvider
          color="#efb100"
          options={{ showSpinner: false }}
          height="3px"
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
  );
}
