"use client";
import "client-only";

import { useZapQuery } from "@/zap/api/hooks";

import { FLAGS } from "..";

type FlagKey = keyof typeof FLAGS;

export function useFlag(flagKey: FlagKey) {
  const result = useZapQuery({
    queryKey: ["flag", { flagKey }],
    queryFn: async () => {
      try {
        const flag = FLAGS[flagKey];
        return await flag();
      } catch {
        // Return fallback value on error
        return !!FLAGS[flagKey]?.defaultValue;
      }
    },
    skipErrorHandling: true, // We handle errors in the fetcher
  });

  return {
    enabled: result.data ?? false,
    ...result,
  };
}
