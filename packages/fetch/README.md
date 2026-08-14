# @zap-studio/fetch

A small fetch wrapper with [**Standard Schema**](https://standardschema.dev/schema) response validation.

Full documentation: [zapstudio.dev/fetch](https://www.zapstudio.dev/fetch)

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
- **Validator-agnostic** — works with any library that implements Standard Schema.
- **Tree-shakeable** — every export is a standalone function with no shared internal state; unused exports are dropped by any modern bundler.

## Quick Start

```ts
import { api } from "@zap-studio/fetch";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

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

## Validator-Agnostic

Works with any library that implements Standard Schema.

```ts
// UserSchema can come from Zod, Valibot, ArkType, or any Standard Schema-compatible library
import type { StandardSchemaV1 } from "@zap-studio/validation";
```

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
