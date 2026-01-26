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

## EventBus error reporting

The `EventBus` does not log to `console` by default. Provide a logger or callback to control error reporting when handlers throw.

```ts
import { EventBus } from "@zap-studio/waitlist/events";

const events = new EventBus({
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

## Stay Updated

Join our [Discord community](https://discord.gg/8Ke3VCjjMf) to stay updated on the latest developments.
