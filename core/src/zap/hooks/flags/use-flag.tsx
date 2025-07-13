"use client";
import "client-only";

import { useCallback, useEffect, useState } from "react";

import { FLAGS } from "@/lib/flags";

type FlagKey = keyof typeof FLAGS;

export function useFlag(flagKey: FlagKey) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFlag = useCallback(async () => {
    try {
      setLoading(true);
      const flag = FLAGS[flagKey];
      const value = await flag();
      setEnabled(value);
    } catch {
      const fallback = FLAGS[flagKey]?.defaultValue || false;
      setEnabled(fallback);
    } finally {
      setLoading(false);
    }
  }, [flagKey]);

  useEffect(() => {
    fetchFlag();
  }, [fetchFlag]);

  return { enabled, loading };
}
