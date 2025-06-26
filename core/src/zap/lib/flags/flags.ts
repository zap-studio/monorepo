import { createPostHogAdapter } from "@flags-sdk/posthog";
import { flag } from "flags/next";

import { ENV, VERCEL } from "@/lib/env.client";

export const postHogAdapter = createPostHogAdapter({
  postHogKey: ENV.NEXT_PUBLIC_POSTHOG_KEY || "",
  postHogOptions: {
    host: ENV.NEXT_PUBLIC_POSTHOG_HOST,
  },
});

export const ZAP_DEFAULT_FLAGS = {
  VERCEL_ENABLE_ANALYTICS: flag({
    key: "vercel-enable-analytics",
    defaultValue: VERCEL,
    decide: () => VERCEL,
  }),
  VERCEL_ENABLE_SPEED_INSIGHTS: flag({
    key: "vercel-enable-speed-insights",
    defaultValue: VERCEL,
    decide: () => VERCEL,
  }),
  POSTHOG_ENABLE_ANALYTICS: flag({
    key: "posthog-enable-analytics",
    defaultValue: false,
    decide: () => false,
  }),
  ENABLE_WAITLIST_PAGE: flag({
    key: "enable-waitlist-page",
    defaultValue: false,
    decide: () => false,
  }),
};
