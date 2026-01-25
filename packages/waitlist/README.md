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

## Quick Start (server-side)

```ts
import { InMemoryAdapter } from "@zap-studio/waitlist/adapters/storage/in-memory";
import { EventBus } from "@zap-studio/waitlist/events";
import { WaitlistServer } from "@zap-studio/waitlist/server";

const adapter = new InMemoryAdapter();
const events = new EventBus();

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
console.log("Position:", position);
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
  - Response: empty body (any JSON is accepted)
- `GET {prefix}/leaderboard`
  - Response: `Array<{ email: string; score: number }>`
- `GET {prefix}/position?email=...`
  - Response: `number | null`

## Configuration

```ts
interface WaitlistConfig {
  referralPrefix?: string
  maxReferrals?: number
  referralCodeLength?: number
  positionStrategy?: "creation-date" | "number-of-referrals"
  rateLimit?: { windowMs: number; max: number }
  emailValidation?: { allowPlus?: boolean; allowSubdomains?: boolean }
}
```

## Creating Custom Adapters

Implement the `WaitlistStorageAdapter` interface to connect your preferred storage:

```ts
interface WaitlistStorageAdapter {
  create(entry: EmailEntry): Promise<EmailEntry>
  createReferral(link: ReferralLink): Promise<ReferralLink>
  update(id: Email, patch: Partial<EmailEntry>): Promise<EmailEntry>
  updateReferral(key: ReferralKey, patch: Partial<ReferralLink>): Promise<ReferralLink>
  delete(id: Email): Promise<void>
  deleteReferral(key: ReferralKey): Promise<void>
  findByEmail(email: Email): Promise<EmailEntry | null>
  findByReferralCode(code: ReferralCode): Promise<EmailEntry | null>
  getReferralCount(email: Email): Promise<number>
  list(): Promise<EmailEntry[]>
  listEmails(): Promise<Email[]>
  listReferrals(): Promise<ReferralLink[]>
  count(): Promise<number>
  countReferrals(): Promise<number>
  getLeaderboard?(): Promise<LeaderboardEntry[]>
}
```
