"use client";
import "client-only";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

import { PUBLIC_ENV } from "@/zap/env/public";

import { SuspendedPostHogPageView } from "../components/posthog-page-view";
import { ZAP_ANALYTICS_CONFIG } from "../zap.plugin.config";

type AnalyticsProviderProps = {
  children: React.ReactNode;
};

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    if (!ZAP_ANALYTICS_CONFIG.ENABLE_POSTHOG) {
      return;
    }

    posthog.init(PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host: PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_HOST || "",
      capture_pageview: false, // Disable automatic pageview tracking
      capture_pageleave: true, // Enable automatic pageleave tracking
    });
  }, []);

  return (
    <>
      {ZAP_ANALYTICS_CONFIG.ENABLE_POSTHOG && (
        <PostHogProvider client={posthog}>
          <SuspendedPostHogPageView />
          {children}
        </PostHogProvider>
      )}
      {!ZAP_ANALYTICS_CONFIG.ENABLE_POSTHOG && children}
    </>
  );
}
