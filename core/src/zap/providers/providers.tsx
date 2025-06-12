"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { NextIntlClientProvider } from "next-intl";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

import { FLAGS } from "@/data/flags";
import { ThemeProvider } from "@/providers/theme.provider";
import SuspendedPostHogPageView from "@/zap/components/analytics/posthog-page-view/posthog-page-view";

interface ProvidersProps {
  children: React.ReactNode;
  nextIntl: {
    locale: string;
  };
}

export default function Providers({ children, nextIntl }: ProvidersProps) {
  const { locale } = nextIntl;
  useEffect(() => {
    if (!FLAGS.ENABLE_POSTHOG) return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // Disable automatic pageview tracking
      capture_pageleave: true, // Enable automatic pageleave tracking
    });
  }, []);

  return (
    <NextIntlClientProvider locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ProgressProvider
          color="#3B82F6"
          options={{ showSpinner: false }}
          height="3px"
          shallowRouting
        >
          {FLAGS.ENABLE_POSTHOG && (
            <PHProvider client={posthog}>
              <SuspendedPostHogPageView />
              {children}
            </PHProvider>
          )}
          {!FLAGS.ENABLE_POSTHOG && children}
        </ProgressProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
