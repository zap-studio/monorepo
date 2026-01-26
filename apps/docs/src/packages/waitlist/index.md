# @zap-studio/waitlist

::: warning Coming Soon
The documentation for `@zap-studio/waitlist` is currently under development. Stay tuned for updates!
:::

## What is @zap-studio/waitlist?

`@zap-studio/waitlist` is a complete waitlist management solution for TypeScript applications. It provides everything you need to implement a waitlist system with referrals, analytics, and more.

## Features (Preview)

- **Easy Integration** - Simple API for adding users to your waitlist
- **Referral System** - Built-in referral tracking and rewards
- **Analytics** - Track waitlist growth and engagement
- **Customizable** - Flexible configuration to match your needs

## EventBus

Waitlist events are powered by `@zap-studio/events` (optional peer dependency). The waitlist package defines the `join`, `referral`, `leave`, and `error` event payloads.

When enabled, events let you:

- trigger emails or notifications on join
- push analytics or metrics
- sync to CRMs or other tools
- keep audit logs of waitlist activity

```ts
import { EventBus } from "@zap-studio/events";
import type { WaitlistEventPayloadMap } from "@zap-studio/waitlist/types";

const events = new EventBus<WaitlistEventPayloadMap>({
  errorEventType: "error",
  errorEventPayload: (err, source) => ({ err, source }),
  onError: (err, { event, errorEmitFailed }) => {
    console.error("EventBus error", { event, err, errorEmitFailed });
  },
});
```

## Installation

```bash
pnpm add @zap-studio/waitlist
# or
npm install @zap-studio/waitlist
```

Optional event hooks:

```bash
pnpm add @zap-studio/events
# or
npm install @zap-studio/events
```

Without `@zap-studio/events`, the SDK does not emit events.

## Stay Updated

Join our [Discord community](https://discord.gg/8Ke3VCjjMf) to stay updated on the latest developments.
