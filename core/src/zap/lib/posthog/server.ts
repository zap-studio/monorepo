import { PostHog } from "posthog-node";

import { warnOptionalEnv } from "@/lib/env";

const NEXT_PUBLIC_POSTHOG_KEY = warnOptionalEnv("NEXT_PUBLIC_POSTHOG_KEY");
const NEXT_PUBLIC_POSTHOG_HOST = warnOptionalEnv("NEXT_PUBLIC_POSTHOG_HOST");

export default function PostHogClient() {
  const posthogClient = new PostHog(NEXT_PUBLIC_POSTHOG_KEY || "", {
    host: NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
