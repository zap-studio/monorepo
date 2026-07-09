---
name: zap-fetch-typed-http
description: Use @zap-studio/fetch in an application. Use when writing typed HTTP clients with $fetch, api.get/post/put/patch/delete, createFetch defaults, Standard Schema response validation, searchParams, json request bodies, FetchError handling, or throwOnFetchError/throwOnValidationError modes.
---

# Zap Fetch Typed HTTP

Use this skill when consuming `@zap-studio/fetch` in an application.

## Core Workflow

1. Decide whether the call needs a raw `Response` or validated data.
2. Use `$fetch(input, options)` for raw responses.
3. Use `$fetch(input, schema, options)` or `api.*(input, schema, options)` for validated JSON responses.
4. Use `createFetch` for shared `baseURL`, headers, query params, or default throw modes.
5. Catch `FetchError` and `ValidationError` explicitly when the caller needs structured handling.

## Usage Patterns

### Raw response

```ts
import { $fetch } from "@zap-studio/fetch";

const response = await $fetch("/health");
const body = await response.json();
```

### Validated response

```ts
import { api } from "@zap-studio/fetch";
import { z } from "zod";

const UserSchema = z.object({ id: z.number(), name: z.string() });
const user = await api.get("/users/1", UserSchema);
```

### Configured client

```ts
import { createFetch } from "@zap-studio/fetch";

const { api, $fetch } = createFetch({
  baseURL: "https://api.example.com",
  headers: { Authorization: `Bearer ${token}` },
  searchParams: { locale: "en" },
});

const user = await api.get("/users/1", UserSchema);
const health = await $fetch("/health");
```

### Non-throw validation

```ts
const result = await api.get("/users/1", UserSchema, {
  throwOnValidationError: false,
});

if (result.issues) {
  return { ok: false, issues: result.issues };
}

return { ok: true, value: result.value };
```

## Error Handling

Catch package-specific errors first and rethrow unknown runtime/schema errors.

```ts
import { FetchError } from "@zap-studio/fetch/errors";
import { ValidationError } from "@zap-studio/validation/errors";

try {
  return await api.get("/users/1", UserSchema);
} catch (error) {
  if (error instanceof FetchError) return { status: error.status };
  if (error instanceof ValidationError) return { issues: error.issues };
  throw error;
}
```

`$fetch` can reject with `FetchError`, `ValidationError`, native `TypeError`, `DOMException` for aborts, `SyntaxError` from `response.json()`, and any error thrown or rejected by the provided Standard Schema validator. `TypeError` includes body/json conflicts, JSON request serialization failures, invalid request/header/search-param setup, network-level fetch failures, and response body read failures.

## Gotchas

- `api.*` helpers are schema-first convenience methods; use `$fetch` for raw `Response`.
- `json` and native `body` are mutually exclusive. `json` stringifies and sets `Content-Type: application/json` when missing.
- Query param precedence is client defaults, existing URL params, then per-request `searchParams`.
- `throwOnFetchError: false` returns the non-ok `Response`; validation still runs if a schema is provided.
- Prefer `createFetch` for app-level API clients instead of repeating base URLs and auth headers.

## References

- Package docs: https://zapstudio.dev/packages/fetch
- llms.txt: https://zapstudio.dev/llms.txt
- llms-full.txt: https://zapstudio.dev/llms-full.txt
