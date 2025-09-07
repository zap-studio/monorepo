"use client";
import "client-only";

import { useMemo } from "react";

import { isPluginEnabled } from "@/lib/plugins";
import { getClientPlugin } from "@/lib/zap.client";
import { TanStackQueryProvider } from "@/zap/api/providers/tanstack-query/provider";

type PluginProvidersProps = {
  children: React.ReactNode;
};

export function PluginProviders({ children }: PluginProvidersProps) {
  const isApiEnabled = useMemo(() => isPluginEnabled("api"), []);
  const isAnalyticsEnabled = useMemo(() => isPluginEnabled("analytics"), []);

  const analytics = getClientPlugin("analytics");
  const AnalyticsProvider = analytics.providers.AnalyticsProvider;

  const wrappedChildren = useMemo(() => {
    let content = children;

    if (isAnalyticsEnabled) {
      content = (
        <AnalyticsProvider config={analytics.config}>
          {content}
        </AnalyticsProvider>
      );
    }

    if (isApiEnabled) {
      content = <TanStackQueryProvider>{content}</TanStackQueryProvider>;
    }

    return content;
  }, [
    children,
    isApiEnabled,
    isAnalyticsEnabled,
    analytics.config,
    AnalyticsProvider,
  ]);

  return <>{wrappedChildren}</>;
}
