import { createFetch } from "@better-fetch/fetch";

import { BASE_URL } from "@/zap.config";

function getBaseURL() {
  // Client-side: use window.location.origin if available
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side: fallback to configured BASE_URL from zap.config.ts
  return BASE_URL;
}

export const $fetch = createFetch({
  baseURL: getBaseURL(),
  throw: true,
});
