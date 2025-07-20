import { PostHog } from "posthog-node";

import { CLIENT_ENV } from "@/lib/env.client";

export default function PostHogClient() {
  const posthogClient = new PostHog(CLIENT_ENV.NEXT_PUBLIC_POSTHOG_KEY || "", {
    host: CLIENT_ENV.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
