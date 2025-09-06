import { PostHog } from "posthog-node";

import { PUBLIC_ENV } from "@/zap/env/public";

export function PostHogClient() {
  const posthogClient = new PostHog(PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
    host: PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
