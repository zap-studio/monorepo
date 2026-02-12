# Universal Application Architecture (UAA)

Architecturing apps *well* is one of the most important things you can do because it keeps projects healthy over the long term.

Too many teams start vibecoding, push in features, and end up with messy codebases, especially now that AI can spin up new ideas in minutes. But be aware, when the stack is messy, it becomes hard to understand what each piece should do.

This guide tries to fix that by giving a clear specification for a portable **Core** and thin **Adapters** so you can keep iterating without breaking the architecture.

Indeed, modern apps run on web, mobile, command-line, desktop, server/API, and background worker platforms. They all need data access, business logic, user interaction, state management, observability, security, and event handling.

Thus, **Universal Application Architecture (UAA)** gives a shared structure so each surface can reuse the same **Core** ideas.

## Definition

### Core

The **Core** of your application contains all the essential business logic, data rules, and fundamental operations that make your app unique.

Think of it as the brain or engine of your application. It's built to be reusable and independent of how users interact with your app (e.g., whether they use a website, a mobile app, or a command-line tool).

### Adapters

**Adapters** are the parts of your application that handle how users actually see and interact with it. These **Adapters** are kept as simple as possible, acting like translators between the user interface and the powerful **Core**.

They adapt your **Core** logic to specific platforms like web browsers, mobile phones, or desktop apps, without adding complex business rules themselves.

### Shared Capabilities

**Shared Capabilities** are services and infrastructure that span multiple layers of your application. Unlike **Core** logic (which lives within specific layers) or **Adapters** (which are platform-specific), **Shared Capabilities** are accessible across all layers and surfaces without belonging to any single one.

Examples include shared observability (logging, tracing, metrics), shared security (authentication, authorization), shared configuration, shared caching, and shared event streaming. These are implemented as lightweight, modular helpers that any layer can import without breaking the single-responsibility principle.

## Taxonomy

UAA splits the system into three zones: the **Core** Architecture (reusable domain code, state, and features), the **Adapters** (routing, parameter parsing, and request lifecycle), and the **Shared Capabilities** (observability, security, and configuration).

### Core Taxonomy

Each layer builds on the one below it and stays focused on its job. Dependencies flow downward—higher layers may import from lower layers, but never the reverse.

#### Layer 1: Primitives

This layer holds the smallest reusable pieces: shared schemas, validation helpers, guarding utilities, and any platform-neutral abstractions.

Primitives do not depend on anything else and can be imported by any other layer without introducing framework logic.

**Sublayers:**

- `schemas/` — data shape definitions and validation rules for domain entities
- `guards/` — runtime type checks and assertion helpers that verify conditions
- `constants/` — immutable values, enumerations, and configuration defaults
- `utils/` — pure functions with no side effects (formatters, parsers, transformers)
- `errors/` — custom error classes and factories for domain-specific failures

**Examples:**

- **Schemas** — `UserSchema`, `OrderSchema`
- **Type guards** — `isAuthenticated()`, `assertNonNull()`
- **Constants** — `OrderStatus.PENDING`, `ErrorCode.NOT_FOUND`
- **Utilities** — `formatDate()`, `slugify()`, `generateUUID()`
- **Errors** — `NotFoundError`, `ValidationError`, `UnauthorizedError`

#### Layer 2: Services

Services group business rules, data access, and domain operations. They expose intent-driven methods that features call, and they only depend on primitives or other services.

Services avoid importing components or **Adapters**-specific code so the business logic stays portable.

**Sublayers:**

- `data/` — data access abstractions that read and write to persistence layers
- `providers/` — integrations with third-party APIs and external service providers
- `rules/` — pure business rules, validations, and domain logic with no I/O
- `handlers/` — command and operation handlers that mutate state or trigger side effects

**Examples:**

- **Data** — `UserRepository.findById()`, `OrderRepository.save()`
- **Providers** — `StripeClient.createCharge()`, `EmailProvider.send()`
- **Rules** — `calculateOrderTotal()`, `validateDiscount()`, `applyTaxRules()`
- **Handlers** — `createUserHandler()`, `processRefundHandler()`, `publishOrderHandler()`

#### Layer 3: State & Events

State represents the facts the UI needs. Events capture domain signals—things that happened—which may update state or trigger services.

This layer keeps reads and writes traceable and keeps components from mutating global state directly.

**Sublayers:**

- `stores/` — global state containers that hold application-wide data
- `events/` — domain event definitions and emitters that signal state changes
- `queries/` — reactive data fetching abstractions that sync server and client state
- `atoms/` — fine-grained atomic state units for isolated reactivity

**Examples:**

- **Global stores** — Zustand, Redux slice, Jotai atoms
- **Domain events** — `OrderPlaced`, `UserRegistered`, `PaymentFailed`
- **Reactive queries** — TanStack Query, SWR hooks
- **Local state** — `useState`, `useReducer`

#### Layer 4: Components

Components render the UI or handle interactions. They read from state, emit events, and call feature entrypoints when they need to orchestrate work.

Components do not call services directly.

**Sublayers:**

- `ui/` — atomic design system elements (buttons, inputs, modals, cards)
- `widgets/` — composite components that combine multiple UI elements
- `layout/` — structural components that define page and section arrangements
- `forms/` — input groups, field wrappers, and validation display components

**Examples:**

- **UI primitives** — `Button`, `Input`, `Modal`, `Card`
- **Composite widgets** — `DataTable`, `DatePicker`, `FileUploader`
- **Layout components** — `Sidebar`, `Header`, `PageContainer`
- **Form components** — `LoginForm`, `CheckoutForm`

#### Layer 5: Features

Features compose services, state, and components. Each feature has one entrypoint for the **Adapters** to call.

A feature starts its trace span, coordinates services, updates state, and tells components what to render.

**Sublayers:**

Features are organized by feature name. Each feature folder may contain:

- `index.ts` — feature entrypoint
- `components/` — feature-specific components (optional)
- `hooks/` — feature-specific hooks (optional)
- `utils/` — feature-specific helpers (optional)

**Examples:**

- **Checkout feature** — orchestrates cart, payment service, order confirmation
- **User onboarding** — coordinates signup, verification, profile setup
- **Dashboard feature** — composes analytics service, charts, filters
- **Search feature** — manages query input, search service, results display

### Adapters

TODO


### Shared Capabilities

**Shared Capabilities** should be rare and only occur when a capability truly spans the entire stack, so we keep them in lightweight infrastructure modules.

Observability (logs, traces, metrics, domain events, error reporting) is a good example: instrumentation lives in `/src/observability`, but it never replaces the single-responsibility nature of the **Core** layers—services or features call the helpers while components and **Adapters** stay focused on their jobs.

Security (authentication, authorization, secrets, guards) lives in middleware or service guards that wrap features and services, keeping policy decisions outside the UI.

Auditing (immutable change records) is a thin wrapper services call without altering state or components.

Caching belongs in services or **Shared Capabilities** helpers, never in components.

Event streaming (Kafka, NATS, webhooks) stays on services or **Adapters** that know how to serialize domain events.

Configuration and feature flags live in a shared config layer so every surface sees the same toggles.

Observe the same pattern for any future **Shared Capabilities** need.

## Project Structure

```
/src
├── core/
│   ├── primitives/
│   │   ├── schemas/
│   │   ├── guards/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── errors/
│   ├── services/
│   │   ├── data/
│   │   ├── providers/
│   │   ├── rules/
│   │   └── handlers/
│   ├── state/
│   │   ├── stores/
│   │   ├── events/
│   │   ├── queries/
│   │   └── atoms/
│   ├── components/
│   │   ├── ui/
│   │   ├── widgets/
│   │   ├── layout/
│   │   └── forms/
│   └── features/
│       ├── checkout/
│       ├── onboarding/
│       ├── dashboard/
│       └── search/
├── adapters/                  # Framework-specific (varies by platform)
│   └── ...                    # e.g., app/ (Next.js), routes/ (TanStack), screens/ (Expo)
└── shared/
    ├── observability/
    ├── security/
    ├── config/
    ├── cache/
    └── events/
```

## Common Project Layouts

Every **Adapters** lives under `/src`, and teams should be explicit about which directories belong to the framework **Adapters** versus the reusable **Core**. This keeps the surface clear even if you have multiple **Adapters** folders.

### Example: Next.js Project Structure

Next.js keeps the `app` directory as the **Adapters**, and it always lives inside `/src` (either `src/app` or nested beneath other folders). Teams should clearly document which paths belong to the **Adapters** versus the reusable **Core** layers, so the split between routing logic and **Core** code stays obvious. The shared **Core** looks like:

```
/src
  /features
  /services
  /state
  /components
  /observability
  /primitives
```

### Example: TanStack Start Project Structure

TanStack Start puts routing in `src/routes` and its document **Adapters** in `src/router.tsx`, which keeps the remainder of `/src` reusable for features, services, and observability ([TanStack Start docs](https://tanstack.com/start/latest/docs/framework/react/guide/routing)).

### Example: Web Server Project Structure

`/server/routes` is the **Adapters**, and `/src` contains framework-agnostic services, state, and **Shared Capabilities**.

### Example: Expo Project Structure

`/app/screens` acts as the **Adapters**, while `/src` holds the shared domain logic and helpers used across surfaces.

### Example: CLI Project Structure

`/commands` is the **Adapters** entry point, and `/src` keeps domain logic and observability helpers.

## Observability Folder Specification: Monitoring and Logging Setup

The `/src/observability` folder stores key helpers:

- `logger.ts` – logging helpers that every layer can use.
- `tracer.ts` – span and context helpers for traces.
- `metrics.ts` – emits latency and business metrics.
- `events.ts` – publishes domain events.
- `error-reporter.ts` – central place to record errors with trace data.

## Data & Trace Flow Model

```
Input
 ↓
Adapters (start trace)
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

## Anti-Patterns: Practices to Avoid

Avoid tying observability to a specific framework, logging only in the **Adapters**, skipping trace propagation, putting business events into plain strings, or emitting metrics inside components—each of those habits scatters responsibility and makes the layers harder to understand.

## Key Takeaways

The Universal Architecture Application (UAA) specification provides a robust framework for building portable, observable, and scalable applications by clearly delineating responsibilities across distinct architectural layers and zones.

It structures applications into a **Core** Architecture, encompassing Primitives, Services, State, Components, and Features, which together form the reusable domain logic. Complementing this **Core** are the **Adapters**, responsible for framework-specific routing, parameter parsing, and request lifecycle management, ensuring that business logic remains decoupled from presentation.

Furthermore, UAA defines **Shared Capabilities** for concerns like Observability, Security, Auditing, Caching, and Event Handling, which span the entire stack but are implemented as lightweight, modular helpers to avoid diluting the single-responsibility principle of the **Core** layers.

By adhering to these principles, UAA enables full execution visibility, cross-surface traceability, structured logging, event-driven extensibility, and compliance readiness, empowering teams to debug, analyze, and evolve their systems with confidence.

## Acknowledgements

The Universal Architecture Application (UAA) specification is a synthesis of established architectural patterns, adapted and refined for modern application development focusing on portability, observability, and scalability. We drew significant inspiration from the following:

- **[Component-based architecture](https://en.wikipedia.org/wiki/Component-based_software_engineering)**: We fully embraced the concept of splitting UI into discrete widgets, which directly inspired our component and feature layers, promoting reusability and clear separation of concerns in the user interface.
- **[Hexagonal Architecture (Ports and Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)**: The core principle of separating the inside (domain logic) from the outside (delivery mechanisms) strongly influenced our **Adapters**/**Core** split. We adopted the idea of "ports" as our feature entrypoints and "adapters" as our framework **Adapters**, ensuring the **Core** remains independent of external technologies.
- **[Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)**: The layered policies and the emphasis on use cases from Clean Architecture were instrumental in shaping our **Core** taxonomy, particularly how services encapsulate business rules and how dependencies flow inward. While we adopted the spirit of dependency rule and separation, we simplified some layers to better fit the dynamic nature of modern web, mobile, and backend applications, prioritizing practicality and developer experience without compromising core principles.
- **[MVC (Model-View-Controller)](https://developer.mozilla.org/en-US/docs/Glossary/MVC)**: The MVC pattern's approach to separating model, view, and controller helped reinforce our decision to keep orchestration logic (features) distinct from UI rendering (components) and data manipulation (services). We specifically drew from MVC's emphasis on keeping the "View" passive and ensuring "Controllers" (our features) handle interactions and updates, rather than components directly calling services or mutating global state.

This specification diverges from some stricter interpretations of these patterns by providing more explicit guidance on **Shared Capabilities** and prioritizing a pragmatic approach to layer definition that supports rapid iteration while maintaining architectural integrity. We focused on distilling the most impactful aspects of these foundational architectures into a coherent and actionable playbook for building resilient applications.
