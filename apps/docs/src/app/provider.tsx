"use client";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import SearchDialog from "@/components/search";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{
        SearchDialog,
      }}
    >
      <ProgressProvider
        color="#efb100"
        height="4px"
        options={{ showSpinner: false }}
        shallowRouting
      >
        {children}
      </ProgressProvider>
    </RootProvider>
  );
}
