# Analytics

**Zap.ts** provides built-in analytics to help you understand user behavior, _track events_, and _monitor your app’s performance_. Fort that, we use [PostHog](https://posthog.com/) and [Vercel Analytics](https://vercel.com/docs/analytics) for analytics by default.

## Overview

- **Zero-config:** Vercel Analytics and Speed Insights are enabled by default.
- **Custom events:** Easily track custom events and user actions.
- **Extensible:** Swap out or extend analytics providers as needed.

## Providers

### Vercel Analytics

**Zap.ts** uses [Vercel Analytics](https://vercel.com/docs/analytics) for out-of-the-box pageview and performance tracking.  

It is automatically included in your app layout and requires no setup if you deploy on Vercel.

### Vercel Speed Insights

[Speed Insights](https://vercel.com/docs/speed-insights) provides real user performance metrics, helping you optimize your app’s loading and interaction times.

### PostHog

[PostHog](https://posthog.com/) is used for advanced event tracking, user analytics, and product insights.  

It is integrated via a custom `Providers` component that initializes PostHog only if `FLAGS.ENABLE_POSTHOG` is enabled.

- **Initialization:** PostHog is set up using your environment variables.
- **Pageviews:** Pageview tracking is handled by the `SuspendedPostHogPageView` component.
- **Custom Events:** You can track custom events anywhere in your app using **PostHog SDK**.

To use PostHog, set the appropriate environment variables (`NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`) and enable the feature flag in `zap.config.ts`.

For more, see the [PostHog documentation](https://posthog.com/docs).

## References

### `Analytics` and `SpeedInsights`

Imported from Vercel packages and rendered in the app layout.

```tsx
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

<Analytics />
<SpeedInsights />
```

---

### `PostHogProvider`

PostHog is initialized and provided to your app via the custom `Providers` component.  

This enables event tracking and pageview analytics when `FLAGS.ENABLE_POSTHOG` is enabled.

```ts
// src/zap/providers/providers.tsx
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { FLAGS } from "@/data/flags";
import SuspendedPostHogPageView from "@/zap/components/features/analytics/posthog-page-view/posthog-page-view";

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    if (!FLAGS.ENABLE_POSTHOG) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false,
      capture_pageleave: true,
    });
  }, []);

  return (
    <>
      {FLAGS.ENABLE_POSTHOG && (
        <PHProvider client={posthog}>
          <SuspendedPostHogPageView />
          {children}
        </PHProvider>
      )}
      {!FLAGS.ENABLE_POSTHOG && children}
    </>
  );
}
```