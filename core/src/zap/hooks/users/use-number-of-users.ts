"use client";
import "client-only";

import { useZapImmutable } from "@/zap/lib/api/hooks/use-zap-immutable";
import { orpc } from "@/zap/lib/orpc/client";

export function useNumberOfUsers() {
  return useZapImmutable(orpc.users.getNumberOfUsers.queryOptions());
}
