import { createPostHogAdapter } from "@flags-sdk/posthog";

import { CLIENT_ENV } from "@/lib/env.client";

export const postHogAdapter = createPostHogAdapter({
  postHogKey: CLIENT_ENV.NEXT_PUBLIC_POSTHOG_KEY || "",
  postHogOptions: {
    host: CLIENT_ENV.NEXT_PUBLIC_POSTHOG_HOST,
  },
});
