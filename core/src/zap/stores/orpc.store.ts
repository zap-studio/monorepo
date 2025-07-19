"use client";
import "client-only";

import { createORPCClient } from "@orpc/client";
import { createORPCReactQueryUtils, type RouterUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import { create } from "zustand";

import type { router } from "@/rpc/router";
import { link } from "@/zap/lib/orpc/client";

type RouterClientType = RouterClient<typeof router>;
type ORPCReactUtils = RouterUtils<RouterClient<typeof router>>;

interface ORPCStore {
  orpc: ORPCReactUtils;
}

export const useORPCStore = create<ORPCStore>(() => {
  const client: RouterClientType = createORPCClient(link);
  const orpc = createORPCReactQueryUtils(client);

  return {
    orpc,
  };
});

export function useORPC() {
  const { orpc } = useORPCStore();
  return orpc;
}
