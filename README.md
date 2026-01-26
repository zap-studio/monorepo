# Zap Studio

We're making the web better.

## The Problem

Every app needs the same core features: waitlists, authentication, payments, analytics.

Yet developers waste weeks reinventing these from scratch—often building poorly, rushing to launch, creating technical debt that haunts them for years.

The alternative? Framework-specific solutions that lock you in. Want to migrate from Next.js to Remix? Rewrite everything.

## Our Solution

We're building **the higher layer above TanStack for modern apps**—agnostic core logic with adapters so you bring your own tools.

**The Zap Studio approach:**
- **Core + Adapters** – Business logic is framework-agnostic, adapters connect to your stack
- **Type-safe by default** – Full TypeScript support, no runtime surprises
- **Zero lock-in** – Switch frameworks without rewriting your app logic
- **Tested extensively** – Comprehensive test coverage ensures reliability
- **Modern stack** – Built with current best practices to avoid technical debt
- **Production-ready** – Not toy examples, real solutions used in production

## Our Packages

**[@zap-studio/events](./packages/events)**  
Lightweight event bus for waitlist event hooks.

**[@zap-studio/fetch](./packages/fetch)**  
Modern HTTP client with proper error handling. Because `fetch()` should have been better from day one.

**[@zap-studio/permit](./packages/permit)**  
Type-safe centralized & secure authorization with zero config.

**[@zap-studio/realtime](./packages/realtime)**  
Realtime events with SSE and WebSocket support.

**[@zap-studio/validation](./packages/validation)**  
Shared Standard Schema utilities and validation helpers.

**[@zap-studio/waitlist](./packages/waitlist)**  
Launch faster with built-in waitlist management, referral tracking, and analytics.

**[@zap-studio/webhooks](./packages/webhooks)**  
Easy webhook handling and validation.

## Documentation

Full documentation for all packages and [Zap.ts](https://github.com/zap-studio/zap.ts) is available at [zapstudio.dev](https://www.zapstudio.dev).
