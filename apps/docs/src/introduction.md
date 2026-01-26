# What is Zap Studio?

We're building the infrastructure layer for modern web development. Zap Studio provides open-source tools and primitives that help developers ship production-ready applications in days, not months.

## The Problem

Every developer starting a new project faces the same challenges: setting up authentication, configuring databases, handling payments, managing emails. This boilerplate work costs teams weeks of development time and introduces countless opportunities for security vulnerabilities.

## Our Solution

We're solving this by building a suite of modular, production-ready tools that just work:

### Zap.ts

Our flagship product is [Zap.ts](https://zapstudio.dev/zap-ts) — the fastest way to go from idea to production. It's a modular starter kit that includes everything you need to build and scale a web application.

**What's included:**

- Authentication with Better Auth
- Database with Drizzle ORM
- UI with Tailwind CSS + shadcn/ui
- Payments with Polar
- Deploy anywhere

### Local.ts

[Local.ts](./local-ts/) is our starter kit for building local-first desktop applications. Your data stays on the device, always available offline, with native performance.

**What's included:**

- Cross-platform desktop apps with Tauri
- SQLite database with Diesel ORM
- Settings, theming, and notifications
- System tray, autostart, and window state
- React + TypeScript frontend

### Developer Infrastructure

We're also building a suite of packages that solve common problems with modern, composable APIs.

**Our engineering principles:**

- **ESM First** — Native ES modules for modern JavaScript. No legacy baggage.
- **100% Type Safe** — Full TypeScript with strict types. Catch bugs before they ship.
- **Modular Architecture** — Core + adapter pattern. Use only what you need.
- **Tree Shakeable** — Zero bloat. Your bundle stays lean.

| Package                                                  | Description                                             | Status         |
| -------------------------------------------------------- | ------------------------------------------------------- | -------------- |
| [@zap-studio/fetch](./packages/fetch/index.md)           | Type-safe fetch wrapper with validation                 | ✅ Available   |
| [@zap-studio/permit](./packages/permit/index.md)         | Type-safe authorization and access control              | ✅ Available   |
| [@zap-studio/validation](./packages/validation/index.md) | Shared Standard Schema utilities and validation helpers | ✅ Available   |
| [@zap-studio/events](./packages/events/index.md)         | Lightweight event bus for event hooks                   | ✅ Available   |
| [@zap-studio/realtime](./packages/realtime/index.md)     | Realtime events with SSE and WebSocket support          | 🚧 Coming Soon |
| [@zap-studio/waitlist](./packages/waitlist/index.md)     | Waitlist management solution                            | ✅ Available   |
| [@zap-studio/webhooks](./packages/webhooks/index.md)     | Webhook handling with signature verification            | 🚧 Coming Soon |

## Why Now?

The JavaScript ecosystem has matured. TypeScript is the standard. ESM is native. Edge runtimes are everywhere. The tools developers use should reflect this new reality — not carry the weight of a decade of backwards compatibility.

We're building the next generation of developer tools from the ground up.
