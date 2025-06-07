import { createFetch } from "@better-fetch/fetch";

import { BASE_URL } from "@/zap.config";

export const $fetch = createFetch({
  baseURL: BASE_URL,
  throw: true,
});
