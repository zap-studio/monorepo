"use client";

import { useState, useEffect, useCallback } from "react";

interface UseCooldownOptions {
  initialValue?: number;
  onComplete?: () => void;
}

export function useCooldown({
  initialValue = 0,
  onComplete,
}: UseCooldownOptions = {}) {
  const [cooldown, setCooldown] = useState(initialValue);

  useEffect(() => {
    if (cooldown <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown, onComplete]);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
  }, []);

  const resetCooldown = useCallback(() => {
    setCooldown(0);
  }, []);

  return {
    cooldown,
    startCooldown,
    resetCooldown,
    isInCooldown: cooldown > 0,
  };
}
