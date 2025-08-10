"use client";
import "client-only";

import { FLAGS } from "..";
import { useZapQuery } from "../../api/hooks";

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
