"use client";
import "client-only";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { PUBLIC_ENV } from "@/zap/env/public";
import type { AnalyticsClientPluginConfig } from "@/zap/plugins/types/analytics.plugin";
import { SuspendedPostHogPageView } from "../components/posthog-page-view";

type AnalyticsProviderProps = {
  children: React.ReactNode;
  config: Partial<AnalyticsClientPluginConfig>;
};

export function AnalyticsProvider({
  children,
  config,
}: AnalyticsProviderProps) {
  useEffect(() => {
    if (!config.ENABLE_POSTHOG) {
      return;
    }

    posthog.init(PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host: PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_HOST || "",
      capture_pageview: false, // Disable automatic pageview tracking
      capture_pageleave: true, // Enable automatic pageleave tracking
    });
  }, [config.ENABLE_POSTHOG]);

  return (
    <>
      {!!config.ENABLE_POSTHOG && (
        <PostHogProvider client={posthog}>
          <SuspendedPostHogPageView />
          {children}
        </PostHogProvider>
      )}
      {!config.ENABLE_POSTHOG && children}
    </>
  );
}
