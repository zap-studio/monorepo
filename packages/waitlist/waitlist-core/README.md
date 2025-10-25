# @zap-studio/waitlist

A lightweight, type-safe, and adapter-agnostic SDK for building and managing waitlists with built-in referral tracking, position management, and email validation.

## Motivation

Building a waitlist for your product launch or beta program often requires implementing the same boilerplate features: email validation, position tracking, referral systems, and duplicate prevention.

**@zap-studio/waitlist** solves this by providing:

- **Adapter Pattern**: Bring your own storage layer (in-memory, Drizzle ORM, Redis, PostgreSQL, etc.)
- **Type Safety**: Built with TypeScript and Zod for runtime validation
- **Event-Driven**: Hook into lifecycle events (join, referral, remove, error)
- **Zero Dependencies**: Core logic has minimal dependencies (just `nanoid` and `zod`)
- **Production Ready**: Configurable email validation, rate limiting, and referral tracking

## Features

- **Flexible Storage** – Works with any database or storage solution via adapters  
- **Referral System** – Generate unique referral codes and track usage  
- **Position Tracking** – Automatically calculate user positions in the waitlist  
- **Email Validation** – Configurable rules (plus addressing, subdomains)  
- **Event Hooks** – React to join, referral, remove, and error events  
- **Type Safe** – Full TypeScript support with Zod schemas  
- **Rate Limiting** – Optional built-in rate limiting configuration  
- **Metadata Support** – Attach custom data to waitlist entries  

## Installation

```bash
pnpm add @zap-studio/waitlist
# or
npm i @zap-studio/waitlist
# or
bun add @zap-studio/waitlist
```

## Quick Start

```ts
import { InMemoryAdapter } from "@zap-studio/waitlist/adapters/in-memory"
import { createWaitlist } from "@zap-studio/waitlist"
import { generateReferralCode } from "@zap-studio/waitlist/utils"

// 1. Initialize adapter (can swap for Drizzle/Redis/etc.)
const adapter = new InMemoryAdapter()

// 2. Create waitlist SDK instance
const waitlist = createWaitlist({
  adapter,
  config: {
    referralPrefix: "REF",
    maxReferrals: 5,
    emailValidation: { 
      allowPlus: false,
      allowSubdomains: true 
    },
  },
})

// 3. Register event hooks
waitlist.on("join", (entry) => {
  console.log(`${entry.email} joined at position ${entry.position}!`)
})

waitlist.on("referral", ({ referralCode, referredEntry }) => {
  console.log(`${referredEntry.email} joined via ${referralCode}`)
})

// 4. User joins the waitlist
const alice = await waitlist.join("alice@example.com")
console.log("Position:", await waitlist.getPosition(alice.id))
// => Position: 1

// 5. Generate and assign referral code
const referralCode = generateReferralCode() // e.g., "4F7-G8H"
await waitlist.update(alice.id, { referralCode })

// 6. Another user joins via referral
const bob = await waitlist.join("bob@example.com", { referralCode })
// Event hook fires: "bob@example.com joined via 4F7-G8H"

// 7. Manage the waitlist
await waitlist.remove(alice.id)
const totalUsers = await waitlist.count()
const allEntries = await waitlist.list()
```

## Configuration

```ts
interface WaitlistConfig {
  referralPrefix?: string           // Prefix for referral codes
  maxReferrals?: number             // Max uses per referral code
  rateLimit?: {                     // Rate limiting config
    windowMs: number
    max: number
  }
  emailValidation?: {               // Email validation rules
    allowPlus?: boolean             // Allow plus addressing (user+tag@domain.com)
    allowSubdomains?: boolean       // Allow subdomain emails (mail.example.com)
  }
}
```

## Creating Custom Adapters

Implement the `WaitlistStorageAdapter` interface to connect your preferred storage:

```ts
interface WaitlistStorageAdapter {
  create(entry: EmailEntry): Promise<EmailEntry>
  update(id: ID, patch: Partial<EmailEntry>): Promise<EmailEntry>
  delete(id: ID): Promise<void>
  findByEmail(email: string): Promise<EmailEntry | null>
  findById(id: ID): Promise<EmailEntry | null>
  list(): Promise<EmailEntry[]>
  count(): Promise<number>
  incrementReferral?(code: string, delta?: number): Promise<number>;
}
```
