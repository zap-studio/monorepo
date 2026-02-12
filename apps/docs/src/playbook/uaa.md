# Universal Architecture Application (UAA)

This guide explains UAA. It shows why apps need a clear core and how we keep frameworks as thin shells.

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

## Cross-Layer Infrastructure

These capabilities span the whole stack and live in infrastructure layers.

- **Observability**: logs, traces, metrics, events, and error reports.
- **Security**: authentication, authorization, secrets, and guards.
- **Auditing**: immutable records for compliance.
- **Caching**: data caches that stay outside component logic.
- **Event streaming**: Kafka, NATS, webhooks, or similar systems.
- **Configuration & feature flags**: global toggles and environment settings.

## Observability Specification

Observability uses a few clear patterns:

- Logging
- Tracing (spans)
- Metrics
- Domain events
- Error reporting

### Logging

- Purpose: record system behavior.
- Rules: use a shared primitive, keep structured data, and call it from every layer.
- Example: `log.info("User fetched", { userId })`.
- Layers: services, features, shell, and components if needed.

### Tracing / Spans

- Purpose: see the path of a request.
- A trace has spans: request → feature → service → external.
- Rules: start the trace in the shell and pass the context down.

### Metrics

- Purpose: measure performance.
- Examples: response time, database latency, cache hits, CLI runtime.
- Rules: emit from services and the shell only; keep components focused on UI.

### Domain Events

- Purpose: capture business actions.
- Examples: `UserSignedUp`, `InvoicePaid`, `DeploymentTriggered`.
- Logs are about operations; events are about domain changes.
- Events can update state, trigger workflows, feed analytics, or stream outward.

### Error Observability

Errors should always include context metadata, the trace ID, the service that failed, and any user info if it helps. Use a shared reporter that adds this data.

## Other Cross-Layer Concerns

### Security

- Includes authentication, authorization, and secret management.
- Pattern: use primitives for tokens, guards for services, and middleware for shells.

### Auditing

- Track who did what.
- Examples: admin deleted a user, a config changed, a payment was refunded.
- Audit logs stay immutable and support compliance needs.

### Caching

- Decide where caches live and keep them out of components.
- Put them in services or infrastructure layers.

### Event Streaming

- Used when systems are distributed.
- Services publish events and features react to them.

### Configuration & Feature Flags

- Use them for rollouts, environments, and UI toggles.
- Store settings in a config layer and expose them safely to every surface.

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

Every shell hooks into the `/src` core folders so features, services, and observability helpers stay the same.

### Next.js

Next.js keeps the `app` directory as the shell, and you can put it either at the project root or under `src/app` if you want to keep tooling files at the top level ([Next.js docs](https://nextjs.org/docs/app/building-your-application/routing)). We treat `/src` as the shared core with:

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

- Full execution visibility.
- Cross-surface traceability.
- Structured logging.
- Event-driven extensibility.
- Compliance readiness.

## Anti-Patterns

Avoid:

- Logging only in the shell.
- Not passing trace information.
- Logging business events as plain strings.
- Putting metrics inside components.
- Tying observability to a specific framework.

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
