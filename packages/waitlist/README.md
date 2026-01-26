# @zap-studio/waitlist

A lightweight, type-safe, and adapter-agnostic waitlist toolkit with referral tracking, email validation, and event hooks.

## Motivation

Building a waitlist for your product launch or beta program often requires implementing the same boilerplate features: email validation, position tracking, referral systems, and duplicate prevention.

**@zap-studio/waitlist** provides:

- **Adapter Pattern**: Bring your own storage layer (in-memory, Drizzle ORM, Redis, PostgreSQL, etc.)
- **Type Safety**: Built with TypeScript and Zod for runtime validation
- **Event Hooks**: Subscribe to join, referral, leave, and error events
- **Minimal Core**: Small surface area you can extend safely

## Features

- **Flexible Storage** – Works with any database or storage solution via adapters
- **Referral System** – Generate unique referral codes and track usage
- **Position Tracking** – Get a user's position in the waitlist
- **Email Validation** – Configurable rules (plus addressing, subdomains)
- **Event Hooks** – React to join, referral, leave, and error events
- **Type Safe** – Full TypeScript support with Zod schemas

## Installation

```bash
pnpm add @zap-studio/waitlist
# or
npm i @zap-studio/waitlist
# or
bun add @zap-studio/waitlist
```

If you want event hooks, also install the optional event bus (peer dependency):

```bash
pnpm add @zap-studio/events
# or
npm i @zap-studio/events
# or
bun add @zap-studio/events
```

Without `@zap-studio/events`, the SDK works normally but does not emit events.

## Optional events

The waitlist SDK does not require an event bus. When you provide one, you can:

- trigger emails or notifications when someone joins
- record analytics or growth metrics
- sync to CRMs or other systems
- build internal audit logs

To enable events, install `@zap-studio/events` and pass an instance to `WaitlistServer`.

## Quick Start (server-side)

Event hooks are optional. Pass an event bus if you want to react to `join`, `referral`, `leave`, and `error`.

```ts
import { InMemoryAdapter } from "@zap-studio/waitlist/adapters/storage/in-memory";
import { EventBus } from "@zap-studio/events";
import type { WaitlistEventPayloadMap } from "@zap-studio/waitlist/types";
import { WaitlistServer } from "@zap-studio/waitlist/server";

const adapter = new InMemoryAdapter();
const events = new EventBus<WaitlistEventPayloadMap>({
  errorEventType: "error",
  errorEventPayload: (err, source) => ({ err, source }),
});

const waitlist = new WaitlistServer({
  adapter,
  events,
  config: {
    emailValidation: { allowPlus: false, allowSubdomains: true },
    referralCodeLength: 8,
  },
});

events.on("join", ({ email }) => {
  console.log(`${email} joined`);
});

const result = await waitlist.join({ email: "alice@example.com" });
if (result.ok) {
  console.log("Referral code:", result.entry.referralCode);
}

const position = await waitlist.getPosition("alice@example.com");
console.log("Position:", position ?? "not found");
```

## EventBus error reporting

`EventBus` does not log to `console` by default. Provide a logger or callback to control how errors are reported when a handler throws.

```ts
import { EventBus } from "@zap-studio/events";
import type { ErrorReporter, ILogger } from "@zap-studio/events/types";
import type { WaitlistEventPayloadMap } from "@zap-studio/waitlist/types";

const logger: ILogger<WaitlistEventPayloadMap> = {
  error: (message, err, context) => {
    console.error(message, err, context);
  },
};

const onError: ErrorReporter<WaitlistEventPayloadMap> = (
  err,
  { event, errorEmitFailed }
) => {
  console.error("EventBus error", { event, err, errorEmitFailed });
};

const events = new EventBus<WaitlistEventPayloadMap>({
  logger, // used when onError is not provided
  onError, // takes precedence over logger
  errorEventType: "error",
  errorEventPayload: (err, source) => ({ err, source }),
});
```

## Quick Start (client-side RPC)

```ts
import { WaitlistClient } from "@zap-studio/waitlist/client";

const client = new WaitlistClient({
  baseUrl: "http://localhost:3000",
  prefix: "/api/waitlist", // optional
});

const result = await client.join({ email: "user@example.com" });
```

## RPC Endpoints

For the client to work over RPC, implement the following HTTP endpoints under the configured `prefix`
(default: `/api/waitlist`):

Example for `join` endpoint:

```ts
import { WaitlistServer } from "@zap-studio/waitlist/server";

const waitlist = new WaitlistServer({ adapter });

// POST {prefix}/join
export async function JoinEndpoint(req: Request): Promise<Response> {
  const { email, referralCode } = await req.json();
  const result = await waitlist.join({ email, referralCode });
  return Response.json(result);
}
```

This handler should only wrap the server SDK; the SDK contains the business logic.

- `POST {prefix}/join`
  - Body: `{ email: string; referralCode?: string }`
  - Response: `{ ok: true; entry: EmailEntry; referralLink?: ReferralLink }`
    or `{ ok: false; reason: "invalid-email"; message?: string }`
- `POST {prefix}/leave`
  - Body: `{ email: string }`
  - Response: `{ ok: true }`
  - Example: `{ "ok": true }`
- `GET {prefix}/leaderboard?positionStrategy=...`
  - Query: `positionStrategy` = `"creation-date"` | `"number-of-referrals"` (optional)
  - Response: `Array<{ email: string; score: number }>`
- `GET {prefix}/position?email=...`
  - Response: `number | null`

## Configuration

```ts
interface WaitlistConfig {
  referralPrefix?: string;
  maxReferrals?: number;
  referralCodeLength?: number;
  positionStrategy?: "creation-date" | "number-of-referrals";
  emailValidation?: { allowPlus?: boolean; allowSubdomains?: boolean };
}
```

## Creating Custom Adapters

Implement the `WaitlistStorageAdapter` interface to connect your preferred storage:

```ts
interface WaitlistStorageAdapter {
  create(entry: EmailEntry): Promise<EmailEntry>;
  createReferral(link: ReferralLink): Promise<ReferralLink>;
  update(id: Email, patch: Partial<EmailEntry>): Promise<EmailEntry>;
  updateReferral(key: ReferralKey, patch: Partial<ReferralLink>): Promise<ReferralLink>;
  delete(id: Email): Promise<void>;
  deleteReferral(key: ReferralKey): Promise<void>;
  findByEmail(email: Email): Promise<EmailEntry | null>;
  findByReferralCode(code: ReferralCode): Promise<EmailEntry | null>;
  getReferralCount(email: Email): Promise<number>;
  list(): Promise<EmailEntry[]>;
  listEmails(): Promise<Email[]>;
  listReferrals(): Promise<ReferralLink[]>;
  count(): Promise<number>;
  countReferrals(): Promise<number>;
  getLeaderboard(positionStrategy?: PositionStrategy): Promise<Leaderboard>;
}
```
