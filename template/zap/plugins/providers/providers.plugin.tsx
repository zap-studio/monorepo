"use client";
import "client-only";

import { useMemo } from "react";

import { getClientPlugin } from "@/lib/zap.client";
import { TanStackQueryProvider } from "@/zap/api/providers/tanstack-query/provider";

type PluginProvidersProps = {
  children: React.ReactNode;
};

export function PluginProviders({ children }: PluginProvidersProps) {
  const analytics = getClientPlugin("analytics");
  const AnalyticsProvider = analytics.providers?.AnalyticsProvider;

  const wrappedChildren = useMemo(() => {
    let content = children;

    if (AnalyticsProvider) {
      content = (
        <AnalyticsProvider config={analytics?.config}>
          {content}
        </AnalyticsProvider>
      );
    }

    content = <TanStackQueryProvider>{content}</TanStackQueryProvider>;

    return content;
  }, [children, analytics?.config, AnalyticsProvider]);

  return <>{wrappedChildren}</>;
}
