"use client";
import "client-only";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { getClientPlugin } from "@/lib/zap.client";
import { PUBLIC_ENV } from "@/zap/env/public";
import { SuspendedPostHogPageView } from "../components/posthog-page-view";

type AnalyticsProviderProps = {
  children: React.ReactNode;
};

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const analytics = getClientPlugin("analytics");

  useEffect(() => {
    if (!analytics.config?.ENABLE_POSTHOG) {
      return;
    }

    posthog.init(PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host: PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_HOST || "",
      capture_pageview: false, // Disable automatic pageview tracking
      capture_pageleave: true, // Enable automatic pageleave tracking
    });
  }, [analytics.config?.ENABLE_POSTHOG]);

  return (
    <>
      {!!analytics.config?.ENABLE_POSTHOG && (
        <PostHogProvider client={posthog}>
          <SuspendedPostHogPageView />
          {children}
        </PostHogProvider>
      )}
      {!analytics.config?.ENABLE_POSTHOG && children}
    </>
  );
}
