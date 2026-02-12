# Universal Architecture Application (UAA)

Architecturing apps well is one of the most important things you can do because it keeps projects healthy over the long term. Too many teams start vibecoding, push in features, and end up with messy codebases, especially now that AI can spin up new ideas in minutes. When the stack is messy, it becomes hard to understand what each piece should do. This guide tries to fix that by giving a clear specification for a portable core and thin shells so you can keep iterating without breaking the architecture.

## Purpose

Modern apps run on many surfaces:

- Web apps
- Mobile apps
- Command-line tools
- Desktop apps
- Servers and APIs
- Background workers

They all need the same things:

- Data access
- Business logic
- User interaction
- State management
- Observability
- Security
- Event handling

UAA gives a shared structure so each surface can reuse the same core ideas.

## Core Principles

- **Components** handle small interaction pieces.
- **Services** keep business logic in one place.
- **State** stays clear and is updated by domain-aware code.
- **Features** connect services and fire events.
- **Frameworks** stay at the edge and hand work to the core.
- **Cross-layer concerns** live in shared infrastructure layers.
- **Observability** is always on so we can debug and monitor easily.

## Architectural Zones

UAA splits the system into three zones:

- **Core Architecture**: reusable domain code, state, and features.
- **Framework Surface Shell**: routing, parameter parsing, and request lifecycle.
- **Cross-Layer Infrastructure**: things like observability, security, and config.

## Core Layer Taxonomy

```
┌──────────────────────────────┐
│ 5. Features / Composition    │
├──────────────────────────────┤
│ 4. Components / Widgets      │
├──────────────────────────────┤
│ 3. State & Events            │
├──────────────────────────────┤
│ 2. Services / Domain Logic   │
├──────────────────────────────┤
│ 1. Primitives / Core         │
└──────────────────────────────┘
```

Each layer builds on the one below it and stays focused on its job.

### Layer 1: Primitives / Core

This layer holds the smallest reusable pieces: shared schemas, validation helpers, guarding utilities, and any platform-neutral abstractions. Primitives do not depend on anything else and can be imported by any other layer without introducing framework logic.

### Layer 2: Services / Domain Logic

Services group business rules, data access, and domain operations. They expose intent-driven methods that features call, and they only depend on primitives or other services. Services avoid importing components or shell-specific code so the business logic stays portable.

### Layer 3: State & Events

State represents the facts the UI needs. Events capture domain signals—things that happened—which may update state or trigger services. This layer keeps reads and writes traceable and keeps components from mutating global state directly.

### Layer 4: Components / Widgets

Components render the UI or handle interactions. They read from state, emit events, and call feature entrypoints when they need to orchestrate work. Components do not call services directly.

### Layer 5: Features / Composition

Features compose services, state, and components. Each feature has one entrypoint for the shell to call. A feature starts its trace span, coordinates services, updates state, and tells components what to render.

## Layer Relationships

Features orchestrate components and map service results into state. Services rely on primitives. State sits between services and components and enforces a clear read/write contract. Events flow upward from components to features and services so we can reason about behavior and avoid scattered side effects.

## Cross-Layer Infrastructure

Cross-layer concerns should be rare and only occur when a capability truly spans the entire stack. Use dedicated infrastructure modules when those cases appear so single-purpose layers remain cohesive.

- **Observability** (logs, traces, metrics, domain events, error reporting) is a good example: the instrumentation primitives live in `/src/observability`, but they never replace the single-responsibility nature of the core layers. When you need to trace a request, call an observable helper from a service or feature without letting components or the shell mix in business rules.
- **Security** (authentication, authorization, secrets, guards) lives in middleware or service guards that wrap features and services, keeping policy decisions outside the UI layers.
- **Auditing** (immutable change records) should be a thin wrapper that services can call without altering state or components.
- **Caching** should be implemented in services or infrastructure helpers and never in components.
- **Event streaming** (Kafka, NATS, webhooks) should be handled by services or cross-layer adapters that understand how to serialize domain events.
- **Configuration & feature flags** live in a config layer exposed to every surface so features and shells see the same values.

Treat each cross-layer concern as a lightweight module that instruments the stack without becoming another layer. Observability is the special case we document because it often needs to touch every layer, but use the same pattern for any future cross-layer need.

## Framework Surface Shell

Shell files follow framework rules (Next.js routers, TanStack Start, Express, Expo, CLI commands). The shell should:

- Start traces.
- Log requests.
- Parse parameters.
- Call feature entrypoints.

### Thin Shell Rule

- Shells may start spans, add request data, and call features.
- Shells must never run business logic or talk directly to the database.

## Feature Entrypoint Rule

Each feature has one entrypoint that:

- Starts a feature span.
- Works with services.
- Emits domain events.
- Updates state.

## Canonical Structures

Every shell lives under `/src`, and teams should be explicit about which directories belong to the framework shell versus the reusable core. This keeps the surface clear even if you have multiple shell folders.

### Next.js

Next.js keeps the `app` directory as the shell, and it always lives inside `/src` (either `src/app` or nested beneath other folders). Teams should clearly document which paths belong to the shell versus the reusable core layers, so the split between routing logic and core code stays obvious. The shared core looks like:

```
/src
  /features
  /services
  /state
  /components
  /observability
  /primitives
```

### TanStack Start

TanStack Start puts routing in `src/routes` and its document shell in `src/router.tsx`, which keeps the remainder of `/src` reusable for features, services, and observability ([TanStack Start docs](https://tanstack.com/start/latest/docs/framework/react/guide/routing)).

### Web Server

`/server/routes` is the shell, and `/src` contains framework-agnostic services, state, and infrastructure.

### Expo

`/app/screens` acts as the shell, while `/src` holds the shared domain logic and helpers used across surfaces.

### CLI

`/commands` is the shell entry point, and `/src` keeps domain logic and observability helpers.

## Observability Folder Spec

The `/src/observability` folder stores key helpers:

- `logger.ts` – logging helpers that every layer can use.
- `tracer.ts` – span and context helpers for traces.
- `metrics.ts` – emits latency and business metrics.
- `events.ts` – publishes domain events.
- `error-reporter.ts` – central place to record errors with trace data.

## Data + Trace Flow Model

```
Input
 ↓
Shell (start trace)
 ↓
Feature (span + orchestration)
 ↓
Service (span + logs + metrics)
 ↓
External system
 ↓
State update
 ↓
Component render
```

## Design Goals

We aim for full execution visibility, cross-surface traceability, structured logging, event-driven extensibility, and compliance readiness so you can debug, analyze, and evolve the system with confidence.

## Anti-Patterns

Avoid tying observability to a specific framework, logging only in the shell, skipping trace propagation, putting business events into plain strings, or emitting metrics inside components—each of those habits scatters responsibility and makes the layers harder to understand.

## Summary

UAA covers:

- **Core Layers**: Primitives → Services → State → Components → Features.
- **Surface Shell**: Framework routing and entrypoints.
- **Cross-Layer Infrastructure**: Observability, Security, Auditing, Caching, Events.

Together they help us build portable, observable, scalable applications.

## Credits

- **[Component-based architecture](https://en.wikipedia.org/wiki/Component-based_software_engineering)** – splitting UI into widgets inspired the component and feature layers.
- **[Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)** – keeping ports/adapters at the edge matches the shell/core split.
- **[Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)** – layered policies and use cases shaped the core taxonomy.
- **[MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC)** – separating model, view, and controller helped keep orchestration outside components.
