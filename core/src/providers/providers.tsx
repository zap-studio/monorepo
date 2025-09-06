"use client";
import "client-only";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@/providers/theme.provider";
import { PluginProviders } from "@/zap/plugins/providers/providers.plugin";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
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
        <NuqsAdapter>
          <PluginProviders>{children}</PluginProviders>
        </NuqsAdapter>
      </ProgressProvider>
    </ThemeProvider>
  );
}
