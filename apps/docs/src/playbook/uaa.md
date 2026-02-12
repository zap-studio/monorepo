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

UAA splits the system into three zones: the **Core** Architecture (reusable business logic, state, and features), the **Adapters** (routing, parameter parsing, and request lifecycle), and the **Shared Capabilities** (observability, security, and configuration).

### Core Taxonomy

The **Core** contains six layers:

| Layer | Name | Purpose |
|-------|------|---------|
| 1 | **Primitives** | Schemas, guards, constants, utilities, errors |
| 2 | **Services** | Data access, external providers, business rules |
| 3 | **State & Signals** | Stores, atoms, sync operations, signals |
| 4 | **Components** | Primitives, styled components, patterns, blocks, utilities, layout |
| 5 | **Features** | Pages (navigate to), Flows (progress through), Widgets (interact with) |
| 6 | **Modules** | Bounded groupings of related features |

Each layer builds on the one below it and stays focused on its job. Dependencies flow downward—higher layers may import from lower layers, but never the reverse.

#### Layer 1: Primitives

This layer holds the smallest reusable pieces: shared schemas, validation helpers, guarding utilities, and any platform-neutral abstractions.

**Primitives** do not depend on anything else and can be imported by any other layer without introducing framework logic.

**Sublayers:**

- `schemas/` — data shape definitions and validation rules for entities
- `guards/` — runtime type checks and assertion helpers that verify conditions
- `constants/` — immutable values, enumerations, and configuration defaults
- `utils/` — pure functions with no side effects (formatters, parsers, transformers)
- `errors/` — custom error classes and factories for application-specific failures

**Examples:**

- **Schemas** — `UserSchema`, `OrderSchema`
- **Type guards** — `isAuthenticated()`, `assertNonNull()`
- **Constants** — `OrderStatus.PENDING`, `ErrorCode.NOT_FOUND`
- **Utilities** — `formatDate()`, `slugify()`, `generateUUID()`
- **Errors** — `NotFoundError`, `ValidationError`, `UnauthorizedError`

#### Layer 2: Services

**Services** group business rules, data access, and core operations. They expose intent-driven methods that features call, and they only depend on primitives or other services.

**Services** avoid importing components or **Adapters**-specific code so the business logic stays portable.

**Sublayers:**

- `data/` — data access abstractions that read and write to persistence layers
- `providers/` — integrations with third-party APIs and external service providers
- `rules/` — pure business rules, validations, and logic with no I/O

Service files (e.g., `auth.ts`, `payment.ts`, `order.ts`) live at the root of `services/` and compose the sublayers above. They expose intent-driven methods that **Features** call. This keeps orchestration in one place—**Features** orchestrate services, services compose their internal pieces.

**Examples:**

- **Data** — `UserRepository.findById()`, `OrderRepository.save()`
- **Providers** — `StripeClient.createCharge()`, `EmailProvider.send()`
- **Rules** — `calculateOrderTotal()`, `validateDiscount()`, `applyTaxRules()`
- **Services** — `AuthService.signIn()`, `PaymentService.charge()`, `OrderService.place()`

#### Layer 3: State & Signals

**State** represents the current data the application needs to function. **Signals** are events that notify the system when something changes, triggering state updates or service reactions.

This layer keeps reads and writes traceable and keeps components from mutating global state directly.

**Sublayers:**

- `stores/` — global state containers that hold application-wide data
- `signals/` — signal definitions that notify when something changes
- `sync/` — reactive data synchronization for fetching and mutating remote state
- `atoms/` — fine-grained atomic state units for isolated reactivity

In component-based frameworks like React or Vue, state and sync logic are often co-located within components using hooks or composables.

If possible, extract them into dedicated hooks (e.g., `useAuthStore`, `useUser()`) that live in this layer—this keeps **State** logic traceable and separate from UI interactions handled in **Components**.

**Examples:**

- **Stores** — `useAuthStore`, `useCartStore`, `useSettingsStore`
- **Signals** — `OrderPlaced`, `UserRegistered`, `PaymentFailed`
- **Sync** — `useUser()`, `useOrders()`, `createOrder()`, `updateProfile()`
- **Atoms** — `currentUserAtom`, `themeAtom`, `localeAtom`

#### Layer 4: Components

**Components** render the UI and handle user interactions. They read from **State**, respond to user actions (clicks, inputs, gestures), and call feature entrypoints when they need to orchestrate work.

**Components** do not call **Services** directly.

This layer follows the [components.build](https://components.build/definitions) taxonomy—an open standard for building modern, composable, and accessible UI artifacts.

**Sublayers:**

- `primitives/` — lowest-level building blocks that provide behavior and accessibility without any styling (headless). They encapsulate semantics, focus management, keyboard interaction, ARIA wiring, and portals. Requires consumer-supplied styling.
- `components/` — styled, reusable UI units that add visual design to primitives or compose multiple elements. They include default styling but remain override-friendly (classes, tokens, slots). May be built from primitives or implement behavior directly.
- `patterns/` — documented compositions of primitives or components that solve specific UI/UX problems. Patterns describe behavior, accessibility, keyboard maps, and failure modes—often with reference implementations.
- `blocks/` — opinionated, production-ready compositions of components that solve concrete interface use cases with content scaffolding. Blocks trade generality for speed of adoption and are typically copy-paste friendly rather than imported as dependencies.
- `utilities/` — non-visual helpers exported for developer ergonomics or composition. Includes hooks, class utilities, keybinding helpers, and focus scopes. Side-effect free and testable in isolation.
- `layout/` — structural components that define page and section arrangements.

**Examples:**

- **Primitives** — `DialogPrimitive`, `PopoverPrimitive`, `TooltipPrimitive`, `MenuPrimitive`
- **Components** — `Button`, `Input`, `Modal`, `Card`, `DataTable`, `Select`
- **Patterns** — form validation with inline errors, confirming destructive actions, typeahead search, optimistic UI
- **Blocks** — `PricingTable`, `AuthScreens`, `OnboardingStepper`, `BillingSettingsForm`
- **Utilities** — `useControllableState`, `useId`, `useFocusTrap`, `cn()` (class merger)
- **Layout** — `Sidebar`, `Header`, `PageContainer`, `Footer`

#### Layer 5: Features

**Features** compose **Services**, **State**, and **Components**. Each feature has one entrypoint for the **Adapters** to call.

A feature starts its trace span, coordinates **Services**, updates **State**, and tells **Components** what to render.

Features are categorized by **user interaction model**.

| Type | Description | Interaction Model |
|------|-------------|-------------------|
| **Page** | Single-route destination composed of blocks. Represents one screen the user navigates to. | User navigates **TO** |
| **Flow** | Multi-step journey with progression state and orchestration logic. Guides the user through a sequence. | User progresses **THROUGH** |
| **Widget** | Portable, embeddable feature unit that can appear anywhere. Often triggered by user action or persistent in the UI. | User interacts **WITH** (in context) |

**Sublayers:**

- `pages/` — single-route view compositions (aligns with [components.build](https://components.build/definitions) **Page**). Composed of blocks arranged in a layout. Tied to a single route/URL with relatively static orchestration (fetch data, render). May contain widgets.
- `flows/` — multi-step journeys that span multiple screens. Maintain progression state (current step, completed steps, navigation). Often have validation gates between steps. May be linear or branching.
- `widgets/` — portable, route-independent feature units. Self-contained state and UI. Often overlay-based (popover, modal, drawer) or embedded. Triggered by user action or always-visible.

**Examples:**

- **Pages** — `DashboardPage`, `SettingsPage`, `ProfilePage`, `LandingPage`, `ProductDetailPage`, `NotFoundPage`
- **Flows** — `CheckoutFlow`, `OnboardingFlow`, `PasswordResetFlow`, `SetupWizardFlow`, `KYCVerificationFlow`
- **Widgets** — `SearchWidget`, `CommandPalette`, `NotificationCenter`, `ChatWidget`, `AIAssistant`, `QuickActions`

#### Layer 6: Modules

**Modules** are bounded groupings of related features. They provide a cohesive public API for a business area and establish clear boundaries between different parts of the application.

Modules group related **Pages**, **Flows**, and **Widgets** that belong to the same area. They can be extracted as packages for reuse across applications.

A module is simply containing features (pages, flows, widgets) that exposes entrypoints to **Adapters**. Modules have no additional sublayers beyond the feature types they contain.

### Adapters

**Adapters** are thin wrappers that connect your **Core** to specific platforms and frameworks.

They handle routing, parameter parsing, request lifecycle, and framework bindings—but contain no business logic.

**Adapter Responsibilities**

- **Routing** — map URLs, commands, or gestures to feature entrypoints
- **Parameter parsing** — extract and validate inputs from requests, forms, or CLI arguments
- **Request lifecycle** — manage authentication checks, middleware, error boundaries
- **Framework bindings** — wire features to framework-specific APIs (hooks, directives, decorators)
- **Trace initialization** — start trace spans before calling into features

**Adapter Types**

| Type | Platform | Entry Point Examples |
|------|----------|---------------------|
| **Web App** | Next.js, TanStack Start, Remix, SvelteKit | `app/`, `routes/`, `pages/` |
| **Mobile App** | Expo, React Native | `app/`, `screens/` |
| **Server/API** | Express, Hono, Fastify, tRPC | `routes/`, `handlers/`, `routers/` |
| **CLI** | Commander, Clap | `commands/`, `bin/` |
| **Desktop** | Electron, Tauri | `windows/`, `views/` |
| **Background Worker** | Bull, Temporal, Inngest | `workers/`, `jobs/`, `workflows/` |

### Shared Capabilities

**Shared Capabilities** are cross-cutting concerns that span multiple layers without belonging to any single one. They should be rare—only add a shared capability when it truly needs to be accessible everywhere.

**Capability Types**

| Capability | Purpose | Examples |
|------------|---------|----------|
| **Observability** | Logs, traces, metrics, error reporting | `logger.info()`, `tracer.startSpan()`, `metrics.increment()` |
| **Security** | Authentication, authorization, encryption | `authGuard()`, `hasPermission()`, `encrypt()` |
| **Configuration** | Feature flags, environment settings | `config.get('featureX')`, `flags.isEnabled('beta')` |
| **Caching** | Caching strategies, invalidation | `cache.get()`, `cache.invalidate()` |
| **Events** | Event bus, webhooks, streaming | `eventBus.publish()`, `eventBus.subscribe()` |

## Project Structure

```
/src
├── core/                        # Portable business logic (framework-agnostic)
│   │
│   ├── primitives/              # Layer 1: No dependencies, imported by all layers
│   │   ├── schemas/             # UserSchema, OrderSchema, ProductSchema
│   │   ├── guards/              # isAuthenticated(), assertNonNull(), hasPermission()
│   │   ├── constants/           # OrderStatus, ErrorCode, DEFAULT_LOCALE
│   │   ├── utils/               # formatDate(), slugify(), generateUUID()
│   │   └── errors/              # NotFoundError, ValidationError, UnauthorizedError
│   │
│   ├── services/                # Layer 2: Depends on primitives only
│   │   ├── data/                # UserRepository, OrderRepository, ProductRepository
│   │   ├── providers/           # StripeClient, EmailProvider, SmsProvider
│   │   ├── rules/               # calculateTotal(), validateOrder(), applyDiscount()
│   │   ├── auth.ts              # AuthService — composes data, providers, rules
│   │   ├── payment.ts           # PaymentService — composes data, providers, rules
│   │   └── order.ts             # OrderService — composes data, providers, rules
│   │
│   ├── state/                   # Layer 3: Depends on primitives, services
│   │   ├── stores/              # useAuthStore, useCartStore, useSettingsStore
│   │   ├── signals/             # OrderPlaced, UserRegistered, PaymentFailed
│   │   ├── sync/                # useUser(), useOrders(), createOrder(), updateProfile()
│   │   └── atoms/               # currentUserAtom, themeAtom, localeAtom
│   │
│   ├── components/              # Layer 4: Depends on primitives, state (see components.build)
│   │   ├── primitives/          # DialogPrimitive, PopoverPrimitive, TooltipPrimitive
│   │   ├── components/          # Button, Input, Modal, Card, DataTable
│   │   ├── patterns/            # form-validation.md, destructive-confirm.md, typeahead.md
│   │   ├── blocks/              # PricingTable, AuthScreens, OnboardingStepper
│   │   ├── utilities/           # useControllableState, useId, useFocusTrap, cn()
│   │   └── layout/              # Sidebar, Header, PageContainer, Footer
│   │
│   ├── features/                # Layer 5: Feature types (pages, flows, widgets)
│   │   ├── pages/               # Standalone pages: LandingPage, NotFoundPage, MaintenancePage
│   │   ├── flows/               # Standalone flows not tied to a module
│   │   └── widgets/             # Standalone widgets: CommandPalette, GlobalSearch
│   │
│   └── modules/                 # Layer 6: Groupings of related features
│       ├── auth/                # Auth features + index.ts entrypoint
│       ├── checkout/            # Checkout features + index.ts entrypoint
│       └── billing/             # Billing features + index.ts entrypoint
│
├── adapters/                    # Framework-specific entry points (thin layer)
│   └── ...                      # Next.js: app/, TanStack: routes/, Expo: screens/
│
└── shared/                      # Cross-cutting capabilities (used by all layers)
    ├── observability/           # logger, tracer, metrics, error-reporter
    ├── security/                # auth guards, middleware, encryption
    ├── config/                  # feature flags, environment, settings
    ├── cache/                   # caching strategies, invalidation
    └── events/                  # event bus, webhooks, streaming
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

`/app/screens` acts as the **Adapters**, while `/src` holds the shared business logic and helpers used across surfaces.

### Example: CLI Project Structure

`/commands` is the **Adapters** entry point, and `/src` keeps business logic and observability helpers.

## Observability Folder Specification: Monitoring and Logging Setup

The `/src/observability` folder stores key helpers:

- `logger.ts` – logging helpers that every layer can use.
- `tracer.ts` – span and context helpers for traces.
- `metrics.ts` – emits latency and business metrics.
- `events.ts` – publishes application events.
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

It structures applications into a **Core** Architecture, encompassing Primitives, Services, State, Components, Features, and Modules, which together form the reusable business logic. Complementing this **Core** are the **Adapters**, responsible for framework-specific routing, parameter parsing, and request lifecycle management, ensuring that business logic remains decoupled from presentation.

Furthermore, UAA defines **Shared Capabilities** for concerns like Observability, Security, Auditing, Caching, and Event Handling, which span the entire stack but are implemented as lightweight, modular helpers to avoid diluting the single-responsibility principle of the **Core** layers.

By adhering to these principles, UAA enables full execution visibility, cross-surface traceability, structured logging, event-driven extensibility, and compliance readiness, empowering teams to debug, analyze, and evolve their systems with confidence.

## Acknowledgements

The Universal Architecture Application (UAA) specification is a synthesis of established architectural patterns, adapted and refined for modern application development focusing on portability, observability, and scalability. We drew significant inspiration from the following:

- **[Component-based architecture](https://en.wikipedia.org/wiki/Component-based_software_engineering)**: We fully embraced the concept of splitting UI into discrete widgets, which directly inspired our component and feature layers, promoting reusability and clear separation of concerns in the user interface.
- **[Hexagonal Architecture (Ports and Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)**: The core principle of separating the inside (business logic) from the outside (delivery mechanisms) strongly influenced our **Adapters**/**Core** split. We adopted the idea of "ports" as our feature entrypoints and "adapters" as our framework **Adapters**, ensuring the **Core** remains independent of external technologies.
- **[Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)**: The layered policies and the emphasis on use cases from Clean Architecture were instrumental in shaping our **Core** taxonomy, particularly how services encapsulate business rules and how dependencies flow inward. While we adopted the spirit of dependency rule and separation, we simplified some layers to better fit the dynamic nature of modern web, mobile, and backend applications, prioritizing practicality and developer experience without compromising core principles.
- **[MVC (Model-View-Controller)](https://developer.mozilla.org/en-US/docs/Glossary/MVC)**: The MVC pattern's approach to separating model, view, and controller helped reinforce our decision to keep orchestration logic (features) distinct from UI rendering (components) and data manipulation (services). We specifically drew from MVC's emphasis on keeping the "View" passive and ensuring "Controllers" (our features) handle interactions and updates, rather than components directly calling services or mutating global state.

This specification diverges from some stricter interpretations of these patterns by providing more explicit guidance on **Shared Capabilities** and prioritizing a pragmatic approach to layer definition that supports rapid iteration while maintaining architectural integrity. We focused on distilling the most impactful aspects of these foundational architectures into a coherent and actionable playbook for building resilient applications.
