# @zap-studio/fetch

A small fetch wrapper with [**Standard Schema**](https://standardschema.dev/schema) response validation.

## Installation

```bash
nub add @zap-studio/fetch
# or
npm install @zap-studio/fetch
# or
pnpm add @zap-studio/fetch
```

## Quick Example

```ts
import { api } from "@zap-studio/fetch";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const user = await api.get("https://api.example.com/users/1", UserSchema);

console.log(user.name);
```

## Before

Without response validation, fetch code often needs unchecked assertions:

```ts
type User = {
  id: number;
  name: string;
};

const response = await fetch("/api/users/1");
const data = await response.json();

const user = data as User;
```

## After

With `@zap-studio/fetch`, the response is validated before it is returned:

```ts
import { api } from "@zap-studio/fetch";

const user = await api.get("/api/users/1", UserSchema);
```

The returned value is inferred from the schema.

## Raw Fetch Usage

Use `$fetch` without a schema when you want the normal `Response` object.

```ts
import { $fetch } from "@zap-studio/fetch";

const response = await $fetch("/api/users/1");
const user = await response.json();
```

Native fetch options are passed through as `RequestInit`.

```ts
const response = await $fetch("/api/users", {
  method: "POST",
  body: JSON.stringify({ name: "Ada" }),
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Validated Fetch Usage

Pass a Standard Schema as the second argument to validate the JSON response.

```ts
import { $fetch } from "@zap-studio/fetch";

const user = await $fetch("/api/users/1", UserSchema);
```

The schema validates the response body, not the request body.

When validation fails, a `ValidationError` is thrown by default.

## API Method Helpers

The `api` export provides common HTTP methods.

```ts
import { api } from "@zap-studio/fetch";

const user = await api.get("/api/users/1", UserSchema);

const created = await api.post("/api/users", UserSchema, {
  json: {
    name: "Ada",
    email: "ada@example.com",
  },
});
```

In this example, `UserSchema` validates the response from `/api/users`. The `json` value is the outgoing request body and is not validated by `UserSchema`.

These helpers set the HTTP method for you. For raw responses without validation, use `$fetch`.

## JSON Request Bodies

Use `json` when you want the package to serialize a JSON request body.

```ts
await api.post("/api/users", UserSchema, {
  json: {
    name: "Ada",
  },
});
```

The schema argument still validates the response. Validate request bodies separately before passing them to `json` if your application needs outgoing payload validation.

This sets:

- `body` to `JSON.stringify(json)`
- `Content-Type` to `application/json` when no content type was already provided

Use native `body` for standard fetch behavior.

```ts
await $fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

`body` and `json` are mutually exclusive.

## Query Params

Use `searchParams` for per-request query params.

```ts
await api.get("/api/users", UserListSchema, {
  searchParams: {
    page: "1",
    limit: "20",
  },
});
```

`searchParams` accepts the same input shapes as `new URLSearchParams(...)`.

```ts
await api.get("/api/users", UserListSchema, {
  searchParams: new URLSearchParams({ q: "ada" }),
});

await api.get("/api/users", UserListSchema, {
  searchParams: "q=ada&page=1",
});

await api.get("/api/users", UserListSchema, {
  searchParams: [["q", "ada"]],
});
```

When defaults, URL query params, and request params overlap, later values win:

1. `createFetch({ searchParams })`
2. query params already present in the URL
3. per-request `searchParams`

## Creating a Client

Use `createFetch` to configure shared defaults.

```ts
import { createFetch } from "@zap-studio/fetch";

const { $fetch, api } = createFetch({
  baseURL: "https://api.example.com",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  searchParams: {
    locale: "en",
  },
});

const user = await api.get("/users/1", UserSchema);
const response = await $fetch("/health");
```

Supported defaults:

| Option                   | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `baseURL`                | Base URL for relative request URLs              |
| `headers`                | Headers applied to every request                |
| `searchParams`           | Query params applied to every request           |
| `throwOnFetchError`      | Throw `FetchError` for non-ok responses         |
| `throwOnValidationError` | Throw `ValidationError` for validation failures |

## Non-throwing Validation

Set `throwOnValidationError: false` to receive the raw Standard Schema result.

```ts
const result = await api.get("/api/users/1", UserSchema, {
  throwOnValidationError: false,
});

if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Validation passed:", result.value);
}
```

## HTTP Errors

By default, non-ok responses throw a `FetchError`.

```ts
import { FetchError } from "@zap-studio/fetch";

try {
  await api.get("/api/users/404", UserSchema);
} catch (error) {
  if (error instanceof FetchError) {
    console.error(error.status);
    console.error(error.response);
  }
}
```

Disable this behavior when you want to handle the raw response yourself.

```ts
const response = await $fetch("/api/users/404", {
  throwOnFetchError: false,
});

console.log(response.status);
```

## Request Objects

The first argument (`input`) uses the same type as global `fetch`.

```ts
const request = new Request("https://api.example.com/users/1", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const user = await $fetch(request, UserSchema);
```

Per-request options are merged on top of the `Request`.

## Standard Schema

`@zap-studio/fetch` validates responses through `@zap-studio/validation`, so it works with any validation library that implements Standard Schema.

Examples include:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)

You can also import Standard Schema types from `@zap-studio/validation` when needed.

```ts
import type { StandardSchemaV1 } from "@zap-studio/validation";
```

## Choosing the Right API

| API           | Use when                                          |
| ------------- | ------------------------------------------------- |
| `$fetch`      | You want raw fetch behavior or a custom method    |
| `api.get`     | You want a validated GET request                  |
| `api.post`    | You want a validated POST request                 |
| `api.put`     | You want a validated PUT request                  |
| `api.patch`   | You want a validated PATCH request                |
| `api.delete`  | You want a validated DELETE request               |
| `createFetch` | You want shared defaults like base URL or headers |

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
