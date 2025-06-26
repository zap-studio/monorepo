# Feature Flags

Zap.ts provides a _robust_ feature flag system using the [Flags SDK](https://flags-sdk.dev/) to enable dynamic toggling of features without redeploying your application.

## Overview

- **Dynamic Control:** Enable or disable features at runtime.
- **Flexible Configuration:** Define flags with fallback values and custom logic.
- **Provider Integration:** Seamlessly integrate with providers like PostHog.

## Providers

### Flags SDK

Zap.ts uses the [Flags SDK](https://flags-sdk.dev/) for managing feature flags. It allows for server-side and client-side flag evaluation with support for multiple providers.

Flags are defined in the `@/data/flags` module and can be extended with custom logic or external services.

```ts
// src/data/flags.ts
import { flag } from "flags/next";

import { ZAP_DEFAULT_FLAGS } from "@/zap.config";

export const FLAGS = {
  ...ZAP_DEFAULT_FLAGS,
  EXAMPLE_FLAG: flag({
    key: "example-flag",
    defaultValue: false,
    decide: () => false,
  }),
};

```

### PostHog Adapter

The PostHog adapter integrates feature flags with [PostHog](https://posthog.com/) for analytics-driven flag decisions.

It is initialized with environment variables (`NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`).

```ts
// src/zap/lib/flags/flags.ts
import { createPostHogAdapter } from "@flags-sdk/posthog";

import { ENV } from "@/lib/env.client";

export const postHogAdapter = createPostHogAdapter({
  postHogKey: ENV.NEXT_PUBLIC_POSTHOG_KEY || "",
  postHogOptions: {
    host: ENV.NEXT_PUBLIC_POSTHOG_HOST,
  },
});

```

### Vercel Integration

Feature flags control Vercel-specific features like [Vercel Analytics](https://vercel.com/docs/analytics) and [Speed Insights](https://vercel.com/docs/speed-insights).

These are enabled conditionally based on the `VERCEL` environment variable and corresponding flags (`VERCEL_ENABLE_ANALYTICS` and `VERCEL_ENABLE_SPEED_INSIGHTS`).

## Usage

### Server-side

For example, flags are used in the `RootLayout` to conditionally render analytics and performance components.

```typescript
// src/app/layout.tsx
import { FLAGS } from "@/data/flags";
import { VERCEL } from "@/lib/env.client";
import Providers from "@/zap/providers/providers";

export default async function RootLayout({ children }) {
  const Analytics = VERCEL ? (await import("@vercel/analytics/react")).Analytics : null;
  const SpeedInsights = VERCEL ? (await import("@vercel/speed-insights/next")).SpeedInsights : null;

  const ENABLE_ANALYTICS = await FLAGS.VERCEL_ENABLE_ANALYTICS();
  const ENABLE_SPEED_INSIGHTS = await FLAGS.VERCEL_ENABLE_SPEED_INSIGHTS();
  const ENABLE_POSTHOG = await FLAGS.POSTHOG_ENABLE_ANALYTICS();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers ENABLE_POSTHOG={ENABLE_POSTHOG}>
          {children}
          {ENABLE_ANALYTICS && Analytics && <Analytics />}
          {ENABLE_SPEED_INSIGHTS && SpeedInsights && <SpeedInsights />}
        </Providers>
      </body>
    </html>
  );
}
```

### Client-side

On the client, the `useFlag` hook allows components to access flag states and handle loading or error states in a type-safe way.

```typescript
import { useFlag } from "@/hooks/useFlag";

export const ExampleComponent = () => {
  const { enabled: showNewFeature, loading } = useFlag("EXAMPLE_FLAG"); // type-safe
  const { enabled: analyticsEnabled } = useFlag("POSTHOG_ENABLE_ANALYTICS");

  if (loading) {
    return <div>Loading feature flags...</div>;
  }

  return (
    <div>
      {showNewFeature && (
        <div>
          <p>This feature is dynamically controlled by a flag.</p>
        </div>
      )}
      
      {analyticsEnabled && (
        <div>Analytics tracking is enabled</div>
      )}
    </div>
  );
};
```

For more details, see the [Flags SDK documentation](https://flags-sdk.dev/) and [PostHog documentation](https://posthog.com/docs).
