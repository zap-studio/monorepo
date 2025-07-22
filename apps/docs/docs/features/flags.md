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

export const FLAGS = {
  EXAMPLE_FLAG: flag({
    key: "example-flag",
    defaultValue: false,
    decide: () => false,
  }),
};

```

## Usage

### Server-side

In a specific route, like a dashboard page, feature flags can be evaluated server-side to decide whether to show experimental features to a given user or segment.

```typescript
// src/app/dashboard/page.tsx
import { FLAGS } from "@/data/flags";
import { ExperimentalWidget } from "@/components/ExperimentalWidget";
import { ClassicWidget } from "@/components/ClassicWidget";

export default async function DashboardPage() {
  const SHOW_EXPERIMENTAL_WIDGET = await FLAGS.EXPERIMENTAL_DASHBOARD_WIDGET(); // A/B test flag

  return (
    <main>
      <h1>Dashboard</h1>
      {SHOW_EXPERIMENTAL_WIDGET ? (
        <ExperimentalWidget />
      ) : (
        <ClassicWidget />
      )}
    </main>
  );
}
```

### Client-side

If the feature should be toggled dynamically on the client side (e.g. to support real-time rollout changes or non-blocking rendering), use the `useFlag` hook:

```typescript
// src/components/DashboardWidget.tsx
import { useFlag } from "@/hooks/useFlag";
import { ExperimentalWidget } from "@/components/ExperimentalWidget";
import { ClassicWidget } from "@/components/ClassicWidget";

export const DashboardWidget = () => {
  const { enabled: showExperimental, loading } = useFlag("EXPERIMENTAL_DASHBOARD_WIDGET");

  if (loading) {
    return <p>Loading widget...</p>;
  }

  return showExperimental ? <ExperimentalWidget /> : <ClassicWidget />;
};
```

### When to Use Server-side vs. Client-side Flags

* Use **server-side flags** when rendering critical layout or routing logic that must not flicker.
* Use **client-side flags** when flags can change at runtime or don’t affect above-the-fold rendering.

### Learn More

For more details, see the [Flags SDK documentation](https://flags-sdk.dev/) and [PostHog documentation](https://posthog.com/docs).
