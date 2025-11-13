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

**[@zap-studio/fetch](./packages/fetch)**  
Modern HTTP client with proper error handling. Because `fetch()` should have been better from day one.

**[@zap-studio/waitlist](./packages/waitlist)**  
Launch faster with built-in waitlist management, referral tracking, and analytics.

**[@zap-studio/webhooks](./packages/webhooks)**  
Lightweight, type-safe webhook router with schema-agnostic validation. Works with any validation library.

More coming soon.

## For Contributors

### Quick Start

```bash
pnpm install
pnpm build
pnpm test
```

### Documentation

See the **[`guides/`](./guides)** folder for contributor documentation:
- **[Release Process](./guides/release.md)** – How to ship packages
- **[Testing](./guides/testing.md)** – Testing strategy and best practices
- **[Linting & Formatting](./guides/linting-formatting.md)** – Code quality tools and standards
- **[Git Hooks](./guides/git-hooks.md)** – Pre-commit and pre-push automation
- **[Turborepo Generators](./guides/turborepo-generators.md)** – Scaffolding new packages

We use pnpm workspaces, Turborepo for builds, and Changesets for versioning.

---

**Building the infrastructure for modern web development.**
