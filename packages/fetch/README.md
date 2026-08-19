# @zap-studio/fetch

A small fetch wrapper with [**Standard Schema**](https://standardschema.dev/schema) response validation.

Full documentation: [zapstudio.dev/fetch](https://www.zapstudio.dev/fetch)

## Motivation

Raw `fetch` does not throw on HTTP errors like 404 or 500 — you must check `response.ok` yourself. And it does not check that the JSON body matches what your code expects.

So most projects add the same pattern at every call site: check the status, parse the JSON, then validate it with `schema.parse(await res.json())`. It is easy to forget one of these steps somewhere, and that is how bad data or a network error goes unnoticed until it breaks something downstream.

`@zap-studio/fetch` makes this pattern the default, not something you write by hand. `api.get(url, UserSchema)` checks the response, validates the body, and throws a clear, typed error — `FetchError` for a bad HTTP status, `ValidationError` for a bad shape — so you always know what went wrong and where.

It uses [Standard Schema](https://standardschema.dev/schema), so you are not locked into one validation library: start with Zod, move to Valibot later, and the call sites do not change. And because it only wraps the global `fetch` function, it is not a Node-only HTTP client — it runs the same way on Bun, Deno, Cloudflare Workers, and in the browser.

## Installation

```bash
npm install @zap-studio/fetch
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/schema), such as Zod, Valibot, or ArkType.

## Features

- **Raw fetch mode** through `$fetch(input, options)` — behaves like native `fetch` and returns the `Response`.
- **Validated fetch mode** through `$fetch(input, schema, options)` — parses and validates the JSON response.
- **HTTP method helpers** through `api.get`, `api.post`, `api.put`, `api.patch`, and `api.delete`.
- **Configured clients** through `createFetch(...)` with shared `baseURL`, headers, query params, and error defaults.
- **JSON convenience** through the `json` option, which serializes the request body and sets `Content-Type`.
- **Structured errors** with `FetchError` for HTTP failures and `ValidationError` for schema failures.
- **`Result`-returning variant** through `$fetchResult`/`apiResult`, for explicit error handling with [`@zap-studio/monads`](https://www.npmjs.com/package/@zap-studio/monads) instead of throw/catch.
- **Validator-agnostic** — works with any library that implements Standard Schema.
- **Optional logging** through `createFetch({ logger })` ([`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger)) — omit it and there's zero logging overhead.
- **Tree-shakeable** — every export is a standalone function with no shared internal state; unused exports are dropped by any modern bundler.

## Quick Start

```ts
import { ConsoleLogger } from "@zap-studio/logger";
import { createFetch } from "@zap-studio/fetch";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});

const logger = new ConsoleLogger({ minLevel: "debug" });
const { api } = createFetch({ logger });

const user = await api.get("https://api.example.com/users/1", UserSchema);

console.log(user.name); // typed as string, validated at runtime
```

## Raw Fetch Mode

Behaves like native `fetch` and returns the `Response`.

```ts
import { $fetch } from "@zap-studio/fetch";

const response = await $fetch("/api/users/1");
const user = await response.json();
```

## Validated Fetch Mode

Parses and validates the JSON response.

```ts
import { $fetch } from "@zap-studio/fetch";

const user = await $fetch("/api/users/1", UserSchema);
```

## HTTP Method Helpers

`api.get`, `api.post`, `api.put`, `api.patch`, and `api.delete`.

```ts
import { api } from "@zap-studio/fetch";

const created = await api.post("/api/users", UserSchema, {
  json: { name: "Ada", email: "ada@example.com" },
});
```

## Configured Clients

Shared `baseURL`, headers, query params, and error defaults.

```ts
import { createFetch } from "@zap-studio/fetch";

const { api } = createFetch({
  baseURL: "https://api.example.com",
  headers: { Authorization: `Bearer ${token}` },
});

const user = await api.get("/users/1", UserSchema);
```

## JSON Convenience

Serializes the request body and sets `Content-Type`.

```ts
await api.post("/api/users", UserSchema, {
  json: { name: "Ada" }, // mutually exclusive with `body`
});
```

## Structured Errors

`FetchError` for HTTP failures and `ValidationError` for schema failures.

```ts
import { FetchError } from "@zap-studio/fetch";
import { ValidationError } from "@zap-studio/validation";

try {
  await api.get("/api/users/1", UserSchema);
} catch (error) {
  if (error instanceof FetchError) console.error(error.status);
  if (error instanceof ValidationError) console.error(error.issues);
}
```

## Result-Returning Variant

`$fetchResult`/`apiResult` — additive alternative to `$fetch`/`api` for consumers who prefer explicit [`Result`](https://www.zapstudio.dev/monads/result)/[`ResultAsync`](https://www.zapstudio.dev/monads/result-async) values over throw/catch. `createFetch(...)` instances get `$fetchResult`/`apiResult` too, alongside `$fetch`/`api`.

```ts
import { isOk } from "@zap-studio/monads";
import { apiResult } from "@zap-studio/fetch";

const result = await apiResult.get("/api/users/1", UserSchema);

if (isOk(result)) {
  console.log(result.value);
} else {
  console.error(result.error); // FetchError | ValidationError
}
```

There's no `throwOnFetchError`/`throwOnValidationError` option — these always return a `Result`. A non-ok response and validation issues both become `Err`; a malformed schema or request still throws, since that's a programmer error, not a value to branch on.

## Validator-Agnostic

Works with any library that implements Standard Schema.

```ts
// UserSchema can come from Zod, Valibot, ArkType, or any Standard Schema-compatible library
import type { StandardSchemaV1 } from "@zap-studio/validation";
```

## Logging

Pass a `logger?: Logger` from [`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger) to `createFetch(...)` to observe requests, responses, and validation failures. Omit it and nothing is logged.

```ts
import { ConsoleLogger } from "@zap-studio/logger";
import { createFetch } from "@zap-studio/fetch";

const logger = new ConsoleLogger({ minLevel: "debug" });
const { api } = createFetch({ baseURL: "https://api.example.com", logger });
```

Outgoing requests log at `debug`, response status logs at `debug` (2xx) or `warn` (non-2xx), and schema validation failures log at `error`.

## OpenTelemetry

`@opentelemetry/api` is a required peer dependency. It's a tiny, side-effect-free package that's a no-op until an app registers a real SDK, so installing it costs nothing at runtime for consumers who never set one up.

Every request gets a `CLIENT` span (`http.request.method`, `url.full`, `http.response.status_code`), and the trace context is injected into the outgoing request's headers so the call continues the caller's distributed trace:

```bash
npm install @opentelemetry/api
```

```ts
import { createFetch } from "@zap-studio/fetch";

const { api } = createFetch({ baseURL: "https://api.example.com" });

// If your app has registered an OpenTelemetry SDK, this call now produces a
// CLIENT span and injects `traceparent` into the outgoing request headers.
// If not, it's a no-op — no wiring required either way.
await api.get("/users/1", UserSchema);
```

On failure — a non-2xx response or a thrown error — the span is marked `ERROR`; thrown errors are also recorded as span exceptions.

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0 (ships native `fetch`)                    |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package relies on the global `fetch` API and ships standard ESM only. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/fetch`).

## License

MIT
