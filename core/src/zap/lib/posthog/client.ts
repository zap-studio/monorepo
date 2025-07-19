import { PostHog } from "posthog-node";

import { ENV } from "@/lib/env.client";

export default function PostHogClient() {
  const posthogClient = new PostHog(ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
    host: ENV.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
