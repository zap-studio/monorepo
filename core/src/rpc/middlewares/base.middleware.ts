import "server-only";

import { os } from "@orpc/server";

export const base = os
  .$context<{
    headers: Headers;
  }>()
  .errors({
    UNAUTHORIZED: {},
  });
