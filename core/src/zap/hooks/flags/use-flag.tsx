"use client";
import "client-only";

import { FLAGS } from "@/lib/flags";
import { useZapImmutable } from "@/zap/lib/api/hooks/use-zap-immutable";

type FlagKey = keyof typeof FLAGS;

export function useFlag(flagKey: FlagKey) {
  const result = useZapImmutable({
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
