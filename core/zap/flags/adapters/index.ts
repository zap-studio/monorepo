import { createPostHogAdapter } from "@flags-sdk/posthog";

import { PUBLIC_ENV } from "../../env/public";

export const postHogAdapter = createPostHogAdapter({
  postHogKey: PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_KEY || "",
  postHogOptions: {
    host: PUBLIC_ENV.NEXT_PUBLIC_POSTHOG_HOST,
  },
});
