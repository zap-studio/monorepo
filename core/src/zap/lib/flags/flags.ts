import { createPostHogAdapter } from "@flags-sdk/posthog";

import { ENV } from "@/lib/env.client";

export const postHogAdapter = createPostHogAdapter({
  postHogKey: ENV.NEXT_PUBLIC_POSTHOG_KEY || "",
  postHogOptions: {
    host: ENV.NEXT_PUBLIC_POSTHOG_HOST,
  },
});
