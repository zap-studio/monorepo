# Universal Application Architecture (UAA)

Architecting apps *well* is one of the most important things you can do because it keeps projects healthy over the long term.

Too many teams start vibecoding, push in features, and end up with messy codebases, especially now that AI can spin up new ideas in minutes. But be aware, when the stack is messy, it becomes hard to understand what each piece should do.

This guide tries to fix that by giving a clear specification for a portable **Core** and thin **Adapters** so you can keep iterating without breaking the architecture. It aims to apply to modern apps (e.g. web, mobile, command-line, desktop, API).

Thus, **Universal Application Architecture (UAA)** gives a shared structure so each surface can reuse the same **Core** ideas.

## Definition

### Core

The **Core** of your application contains all the essential business logic, data rules, and fundamental operations that make your app unique.

Think of it as the brain or engine of your application. It's built to be reusable and independent of how users interact with your app (e.g., whether they use a website, a mobile app, or a command-line tool).

### Adapters

**Adapters** are the parts of your application that handle how users actually see and interact with it. **Adapters** are kept thin, acting as translators between the platform and the **Core**.

They adapt your **Core** logic to specific platforms like web browsers, mobile phones, or desktop apps, without adding complex business rules themselves.

### Shared Capabilities

**Shared Capabilities** are services and infrastructure that span multiple layers of your application. Unlike **Core** logic (which lives within specific layers) or **Adapters** (which are platform-specific), **Shared Capabilities** are accessible across all layers and surfaces without belonging to any single one.

## Taxonomy

**UAA** splits the system into three zones: the **Core** (reusable business logic, state, and features), the **Adapters** (routing, parameter parsing, and request lifecycle), and the **Shared Capabilities** (observability, security, and configuration).

### Core Taxonomy

The **Core** contains five layers:

| Layer | Name | Purpose |
|-------|------|---------|
| 1 | **Primitives** | Schemas, guards, constants, utilities, errors |
| 2 | **Services** | Clients, data access, external providers, business rules |
| 3 | **State & Signals** | Stores, atoms, sync operations, signals |
| 4 | **Components** | Primitives, styled components, patterns, blocks, utilities, layout |
| 5 | **Features** | Pages (navigate to), Flows (progress through), Widgets (interact with) |

Each layer builds on the one below it and stays focused on its job. Dependencies flow downward—higher layers may import from lower layers, but never the reverse.

#### Layer 1: Primitives

This layer holds the smallest reusable pieces: shared **schemas**, validation helpers, **guards**, and any platform-neutral abstractions.

**Primitives** do not depend on anything else and can be imported by any other layer without introducing framework logic.

**Sublayers:**

- **schemas** — data shape definitions and validation rules for entities
- **guards** — runtime type checks and assertion helpers that verify conditions
- **constants** — immutable values, enumerations, and configuration defaults
- **utils** — pure functions with no side effects (formatters, parsers, transformers)
- **errors** — custom error classes and factories for application-specific failures

**Examples:**

- **Schemas** — `UserSchema`, `OrderSchema`
- **Type guards** — `assertNonNull()`, `assertNever()`
- **Constants** — `ORDER_STATUSES.PENDING`, `ERROR_CODE.NOT_FOUND`
- **Utilities** — `formatDate()`, `slugify()`, `generateUUID()`
- **Errors** — `NotFoundError`, `ValidationError`, `UnauthorizedError`

#### Layer 2: Services

**Services** group business rules, data access, and core operations. They expose intent-driven methods that features call, and they only depend on primitives or other services.

**Services** avoid importing components or **Adapters**-specific code so the business logic stays portable.

**Sublayers:**

- **clients** — transport-layer abstractions for HTTP, WebSocket, and other protocols. Clients are generic and reusable—not tied to any specific provider.
- **data** — data access abstractions that read and write to persistence layers
- **providers** — integrations with third-party APIs and external service providers. Each provider either uses a dedicated SDK directly (e.g., `stripe`, `@aws-sdk/*`) or configures a client instance with provider-specific settings (base URL, auth headers, interceptors).
- **rules** — pure business rules, validations, and logic with no I/O

Service files (e.g., `auth.ts`, `payment.ts`, `order.ts`) live at the root of `services/` and compose the sublayers above. They expose intent-driven methods that **Features** call. This keeps orchestration in one place—**Features** orchestrate services, services compose their internal pieces.

**Examples:**

- **Clients** — `createHttpClient()`, `WebSocketManager`, `GraphQLClient`
- **Data** — `UserRepository.findById()`, `OrderRepository.save()`
- **Providers** — `StripeClient.createCharge()`, `EmailProvider.send()`
- **Rules** — `calculateOrderTotal()`, `validateDiscount()`, `applyTaxRules()`
- **Services** — `AuthService.signIn()`, `PaymentService.charge()`, `OrderService.place()`

#### Layer 3: State & Signals

**State** represents the current data the application needs to function. **Signals** are events that notify the system when something changes, triggering state updates or service reactions.

This layer keeps reads and writes traceable and keeps components from mutating global state directly.

**Sublayers:**

- **stores** — global state containers that hold application-wide data
- **signals** — signal definitions that notify when something changes
- **sync** — reactive data synchronization for fetching and mutating remote state
- **atoms** — fine-grained atomic state units for isolated reactivity

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

- **primitives** — lowest-level building blocks that provide behavior and accessibility without any styling (headless). They encapsulate semantics, focus management, keyboard interaction, ARIA wiring, and portals. Requires consumer-supplied styling.
- **components** — styled, reusable UI units that add visual design to primitives or compose multiple elements. They include default styling but remain override-friendly (classes, tokens, slots). May be built from primitives or implement behavior directly.
- **blocks** — opinionated, production-ready compositions of components that solve concrete interface use cases with content scaffolding. Blocks trade generality for speed of adoption and are typically copy-paste friendly rather than imported as dependencies.
- **utilities** — non-visual helpers exported for developer ergonomics or composition. Includes hooks, class utilities, keybinding helpers, and focus scopes. Side-effect-free and testable in isolation.
- **layout** — structural components that define page and section arrangements.

**Examples:**

- **Primitives** — `DialogPrimitive`, `PopoverPrimitive`, `TooltipPrimitive`, `MenuPrimitive`
- **Components** — `Button`, `Input`, `Modal`, `Card`, `DataTable`, `Select`
- **Blocks** — `PricingTable`, `AuthScreens`, `OnboardingStepper`, `BillingSettingsForm`
- **Utilities** — `useControllableState`, `useId`, `useFocusTrap`, `cn()` (class merger)
- **Layout** — `Sidebar`, `Header`, `PageContainer`, `Footer`

#### Layer 5: Features

**Features** compose **Services**, **State**, and **Components**. Each feature has one entrypoint for the **Adapters** to call.

A feature starts its trace span, coordinates **Services**, updates **State**, and tells **Components** what to render.

**Features** are categorized by user interaction model.

| Type | Description | Interaction Model |
|------|-------------|-------------------|
| **Page** | Single-route destination composed of blocks. Represents one screen the user navigates to. | User navigates **TO** |
| **Flow** | Multi-step journey with progression state and orchestration logic. Guides the user through a sequence. | User progresses **THROUGH** |
| **Widget** | Portable, embeddable feature unit that can appear anywhere. Often triggered by user action or persistent in the UI. | User interacts **WITH** (in context) |

**Sublayers:**

- **pages** — single-route view compositions (aligns with [components.build](https://components.build/definitions) **Page**). Composed of blocks arranged in a layout. Tied to a single route/URL with relatively static orchestration (fetch data, render). May contain widgets.
- **flows** — multi-step journeys that span multiple screens. Maintain progression state (current step, completed steps, navigation). Often have validation gates between steps. They may be linear or branching.
- **widgets** — portable, route-independent feature units. Self-contained state and UI. Often overlay-based (popover, modal, drawer) or embedded. Triggered by user action or always-visible.

**Examples:**

- **Pages** — `DashboardPage`, `SettingsPage`, `ProfilePage`, `LandingPage`, `ProductDetailPage`, `NotFoundPage`
- **Flows** — `CheckoutFlow`, `OnboardingFlow`, `PasswordResetFlow`, `SetupWizardFlow`, `KYCVerificationFlow`
- **Widgets** — `SearchWidget`, `CommandPalette`, `NotificationCenter`, `ChatWidget`, `AIAssistant`, `QuickActions`

**Organization:**

Features can be organized in two ways:

1. **Standalone** — Features that don't belong to a specific area live directly in `pages/`, `flows/`, or `widgets/`
2. **Grouped** — Related features can be grouped in a subfolder (e.g., `auth/`, `checkout/`)

```text
features/
├── pages/                    # Standalone pages
│   ├── LandingPage.tsx
│   └── NotFoundPage.tsx
├── widgets/                  # Standalone widgets
│   └── CommandPalette.tsx
├── auth/                     # Grouped features
│   ├── pages/
│   ├── flows/
└── checkout/                 # Another group
    ├── pages/
    ├── flows/
```

Grouping is an *organizational choice*, not a separate layer. Grouped features follow the same sublayer structure (**pages**, **flows**, **widgets**). This keeps the layer hierarchy clean—**Adapters** always call into **Features**, whether standalone or grouped.

> **Recommendation:** Document your feature organization decisions. Clear documentation helps teams understand when to create standalone features versus grouped features, ensuring consistent structure as the codebase grows.

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

#### Interceptors

**Interceptors** are adapter-level hooks that process input before it reaches feature entrypoints. They run in a chain — each interceptor can inspect, transform, or reject the input before passing it to the next one.

Every adapter type has interceptors, but they manifest differently depending on the platform:

| Adapter Type | Interceptor Manifests As | Examples |
|-------------|--------------------------|----------|
| **Web App** | HTTP middleware, route guards | Auth check before rendering a page |
| **Server/API** | Request middleware, route-level hooks | Rate limiting, CORS, body parsing |
| **CLI** | Command hooks, argument preprocessors | Permission check before executing a command |
| **Mobile App** | Navigation guards, screen interceptors | Auth gate before navigating to a screen |
| **Desktop** | Event filters, window guards | License check before opening a window |

Interceptor **wiring** (registering the hook with the platform framework) always belongs in **Adapters**. The **logic** that an interceptor executes may come from different places depending on the concern:

| Concern | Logic Lives In | Adapter Wires It As |
|---------|---------------|---------------------|
| **Rate limiting** | **Shared Capabilities** (`shared/security/`) | Request interceptor |
| **Authentication** | **Shared Capabilities** (`shared/security/`) | Global interceptor or route guard |
| **Authorization** | **Core Services** (`core/services/rules/`) | Per-route / per-command interceptor |
| **Logging** | **Shared Capabilities** (`shared/observability/`) | Global interceptor |
| **CORS / Body parsing** | **Adapters** (purely framework-specific) | Global interceptor |
| **Input validation** | **Core Primitives** (`core/primitives/schemas/`) | Per-route / per-command interceptor |

The key principle: **Adapters** decide *when* and *where* interceptors run (globally, per-route, per-command), while the **Core** and **Shared Capabilities** provide the *what* (the actual logic). This keeps interceptors portable — switching from Express to Hono, or from Commander to Clap, means rewriting the thin wiring layer, not the rate limiting algorithm or authentication logic.

```text
interceptors/                # Interceptor wiring (adapter-specific)
├── rate-limit.ts            # Wires shared/security/rateLimiter into the platform hook
├── auth.ts                  # Wires shared/security/verifyToken into the platform hook
├── cors.ts                  # Pure adapter concern — configures CORS headers (web/API only)
└── validate.ts              # Wires core/primitives/schemas into input validation
```

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

```text
/src
├── core/                        # Portable business logic (framework-agnostic)
│   │
│   ├── primitives/              # Layer 1: No dependencies, imported by all layers
│   │   ├── schemas/             # UserSchema, OrderSchema, ProductSchema
│   │   ├── guards/              # assertNonNull(), assertNever()
│   │   ├── constants/           # ORDER_STATUSES, ERROR_CODE
│   │   ├── utils/               # formatDate(), slugify(), generateUUID()
│   │   └── errors/              # NotFoundError, ValidationError, UnauthorizedError
│   │
│   ├── services/                # Layer 2: Depends on primitives only
│   │   ├── clients/             # createHttpClient(), WebSocketManager, GraphQLClient
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
│   ├── components/              # Layer 4: Depends on primitives, state
│   │   ├── primitives/          # DialogPrimitive, PopoverPrimitive, TooltipPrimitive
│   │   ├── components/          # Button, Input, Modal, Card, DataTable
│   │   ├── blocks/              # PricingTable, AuthScreens, OnboardingStepper
│   │   ├── utilities/           # useControllableState, useId, useFocusTrap, cn()
│   │   └── layout/              # Sidebar, Header, PageContainer, Footer
│   │
│   └── features/                # Layer 5: Feature types (pages, flows, widgets)
│       ├── pages/               # Standalone pages: LandingPage, NotFoundPage
│       ├── flows/               # Standalone flows
│       ├── widgets/             # Standalone widgets: CommandPalette, GlobalSearch
│       ├── auth/                # Grouped features: pages/, flows/
│       └── checkout/            # Grouped features: pages/, flows/
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

## Optional Layers & Sublayers

Not every application needs every layer or sublayer. The **UAA** taxonomy describes the *full spectrum* of concerns an application might have—your project should only include what it actually uses. Empty layers and placeholder directories add noise without value.

**Which layers apply depends on the adapter type:**

| Layer | Web App | Mobile App | Server/API | CLI | Desktop |
|-------|---------|------------|------------|-----|---------|
| **Primitives** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Services** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **State & Signals** | ✅ | ✅ | Rare | TUI only | ✅ |
| **Components** | ✅ | ✅ | ❌ | TUI only | ✅ |
| **Features** | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Rule of thumb:** If a layer or sublayer would be an empty directory, don't create it. Add it when you have something to put in it. The taxonomy is a map of *possible* concerns, not a checklist of required directories.

## Key Takeaways

The **Universal Application Architecture (UAA)** specification provides a robust framework for building portable, observable, and scalable applications by clearly delineating responsibilities across distinct architectural layers and zones.

It structures applications into a **Core** Architecture, encompassing **Primitives**, **Services**, **State**, **Components**, and **Features**, which together form the reusable business logic.

Complementing this **Core** are the **Adapters**, responsible for framework-specific routing, parameter parsing, and request lifecycle management, ensuring that business logic remains decoupled from presentation.

Furthermore, **UAA** defines **Shared Capabilities** for concerns like **Observability**, **Security**, **Configuration**, **Caching**, and **Events**, which span the entire stack but are implemented as lightweight, modular helpers to avoid diluting the single-responsibility principle of the **Core** layers.

By adhering to these principles, **UAA** enables full execution visibility, cross-surface traceability, structured logging, event-driven extensibility, and compliance readiness, empowering teams to debug, analyze, and evolve their systems with confidence.

## Terminology Rationale

This section explains why we chose specific terms throughout the specification.

### Zones

| Term | Why This Name |
|------|---------------|
| **Core** | Represents the essential, central part of the application—the business logic that remains constant regardless of platform. Simple, intuitive, and widely understood. |
| **Adapters** | Borrowed from [Hexagonal Architecture (Ports and Adapters)](https://alistair.cockburn.us/hexagonal-architecture/). Clearly conveys the role: adapting the Core to different platforms without containing logic. |
| **Shared Capabilities** | Describes cross-cutting concerns that are truly shared across all layers. "Capabilities" implies functionality that enables other parts. |

### Layers

| Term | Why This Name |
|------|---------------|
| **Primitives** | The most basic, foundational building blocks. Like primitives in programming languages—simple, composable, no dependencies. |
| **Services** | Industry-standard term for encapsulated business operations. The intent is clear that services serve other parts of the application. |
| **State & Signals** | "State" is universal for application data. "Signals" distinguishes reactive notifications from UI events—borrowed from [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming). |
| **Components** | Industry-standard term for reusable UI units. Aligns with component-based frameworks ([React](https://react.dev/), [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/)) and [components.build](https://components.build/) taxonomy. |
| **Features** | Represents user-facing functionality. A feature is something users interact with—pages they visit, flows they complete, widgets they use. |

### Sublayers

| Layer | Sublayer | Why This Name |
|-------|----------|---------------|
| **Primitives** | **schemas** | Data shape definitions—"schema" is standard terminology for structured data validation. |
| | **guards** | Runtime checks that "guard" against invalid states—borrowed from [TypeScript type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates). |
| | **constants** | Immutable values—standard programming term |
| | **utils** | Short for utilities—pure helper functions, widely understood |
| | **errors** | Custom error types—self-explanatory |
| **Services** | **clients** | Transport-layer abstractions—generic, reusable HTTP, WebSocket, and GraphQL clients. |
| | **data** | Data access layer—abstracts persistence concerns |
| | **providers** | External service integrations—"provides" third-party functionality. Uses either a dedicated SDK directly or a configured client instance with provider-specific settings. |
| | **rules** | Pure business logic—rules that govern behavior without I/O |
| **State & Signals** | **stores** | State containers—borrowed from [Redux](https://redux.js.org/)/[Zustand](https://zustand.docs.pmnd.rs/) terminology. |
| | **signals** | Reactive notifications—from [Solid.js](https://www.solidjs.com/) and [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming). |
| | **sync** | Synchronizes remote and local state—covers both fetching and mutating. |
| | **atoms** | Fine-grained state units—from [Jotai](https://jotai.org/)/[Recoil](https://recoiljs.org/) terminology. |
| **Components** | **primitives** | Headless behavioral blocks—aligns with [components.build](https://components.build/definitions), [Radix UI](https://www.radix-ui.com/), and [Base UI](https://base-ui.com/). |
| | **components** | Styled UI units—standard term, distinct from primitives. |
| | **blocks** | Opinionated compositions—aligns with [components.build](https://components.build/definitions) Block definition. |
| | **utilities** | Non-visual helpers—hooks, class utilities, focus scopes. |
| | **layout** | Structural arrangement—headers, sidebars, containers. |
| **Features** | **pages** | Single-route destinations—aligns with [components.build](https://components.build/definitions) Page definition. |
| | **flows** | Multi-step journeys—conveys progression and orchestration. |
| | **widgets** | Portable, embeddable units—self-contained interactive elements. |
| **Adapters** | **interceptors** | Platform-neutral term for hooks that process input before it reaches features. Preferred over "middleware" (HTTP-specific). Borrowed from [Angular](https://angular.dev/guide/http/interceptors), [gRPC](https://grpc.io/docs/guides/interceptors/), and [Axios](https://axios-http.com/docs/interceptors). |

## Acknowledgements

The **Universal Application Architecture (UAA)** specification is a synthesis of established architectural patterns, adapted and refined for modern application development focusing on portability, observability, and scalability.

We drew significant inspiration from the following:

- **[Component-based architecture](https://en.wikipedia.org/wiki/Component-based_software_engineering)**: We fully embraced the concept of splitting UI into discrete widgets, which directly inspired our component and feature layers, promoting reusability and clear separation of concerns in the user interface.
- **[Hexagonal Architecture (Ports and Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)**: The core principle of separating the inside (business logic) from the outside (delivery mechanisms) strongly influenced our **Adapters**/**Core** split. We adopted the idea of "ports" as our feature entrypoints and "adapters" as our framework **Adapters**, ensuring the **Core** remains independent of external technologies.
- **[Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)**: The layered policies and the emphasis on use cases from Clean Architecture were instrumental in shaping our **Core** taxonomy, particularly how services encapsulate business rules and how dependencies flow inward.
- **[MVC (Model-View-Controller)](https://developer.mozilla.org/en-US/docs/Glossary/MVC)**: The MVC pattern's approach to separating model, view, and controller helped reinforce our decision to keep orchestration logic (features) distinct from UI rendering (components) and data manipulation (services). We specifically drew from MVC's emphasis on keeping the "View" passive and ensuring "Controllers" (our features) handle interactions and updates, rather than components directly calling services or mutating global state.

This specification diverges from some stricter interpretations of these patterns by providing more explicit guidance on **Shared Capabilities** and prioritizing a pragmatic approach to layer definition that supports rapid iteration while maintaining architectural integrity.
