"use client";
import "client-only";

import { useZapImmutable } from "@/zap/lib/api/hooks/use-zap-immutable";
import { useORPC } from "@/zap/stores/orpc.store";

export function useNumberOfUsers() {
  const orpc = useORPC();

  return useZapImmutable(
    orpc.users.getNumberOfUsers.key(),
    orpc.users.getNumberOfUsers.queryOptions().queryFn,
  );
}
