import { BASE_URL } from "@/zap.config";
import { createFetch } from "@better-fetch/fetch";

export const $fetch = createFetch({
  baseURL: BASE_URL,
  throw: true,
});
