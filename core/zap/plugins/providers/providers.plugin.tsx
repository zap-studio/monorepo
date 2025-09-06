"use client";
import "client-only";

import { useMemo } from "react";

import { isPluginEnabled } from "@/lib/plugins";
import { AnalyticsProvider } from "@/zap/analytics/providers/analytics.provider";
import { TanStackQueryProvider } from "@/zap/api/providers/tanstack-query/provider";

type PluginProvidersProps = {
  children: React.ReactNode;
};

export function PluginProviders({ children }: PluginProvidersProps) {
  const isApiEnabled = useMemo(() => isPluginEnabled("api"), []);
  const isAnalyticsEnabled = useMemo(() => isPluginEnabled("analytics"), []);

  const wrappedChildren = useMemo(() => {
    let content = children;

    if (isAnalyticsEnabled) {
      content = <AnalyticsProvider>{content}</AnalyticsProvider>;
    }

    if (isApiEnabled) {
      content = <TanStackQueryProvider>{content}</TanStackQueryProvider>;
    }

    return content;
  }, [children, isApiEnabled, isAnalyticsEnabled]);

  return <>{wrappedChildren}</>;
}
