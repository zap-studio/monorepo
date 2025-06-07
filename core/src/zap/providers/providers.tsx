"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

import { FLAGS } from "@/data/flags";
import { ThemeProvider } from "@/providers/theme.provider";
import SuspendedPostHogPageView from "@/zap/components/analytics/posthog-page-view/posthog-page-view";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    if (!FLAGS.ENABLE_POSTHOG) return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // Disable automatic pageview tracking
      capture_pageleave: true, // Enable automatic pageleave tracking
    });
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {FLAGS.ENABLE_POSTHOG && (
        <PHProvider client={posthog}>
          <SuspendedPostHogPageView />
          {children}
        </PHProvider>
      )}
      {!FLAGS.ENABLE_POSTHOG && children}
    </ThemeProvider>
  );
}
