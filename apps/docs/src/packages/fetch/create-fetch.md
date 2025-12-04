# Factory Pattern with createFetch

The `createFetch` function allows you to create pre-configured fetch instances with base URLs and default headers. This is perfect for building API clients.

## Basic Usage

```typescript
import { z } from "zod";
import { createFetch } from "@zap-studio/fetch";

// Create a configured instance
const { $fetch, api } = createFetch({
  baseURL: "https://api.example.com",
  headers: {
    Authorization: "Bearer your-token",
    "X-API-Key": "your-api-key",
  },
});

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Now use relative paths - baseURL is prepended automatically
const user = await api.get("/users/1", UserSchema);

// POST with auto-stringified body
const newUser = await api.post("/users", UserSchema, {
  body: { name: "John Doe" },
});
```

## Factory Options

| Option                   | Type          | Default | Description                                           |
| ------------------------ | ------------- | ------- | ----------------------------------------------------- |
| `baseURL`                | `string`      | `""`    | Base URL prepended to relative paths only             |
| `headers`                | `HeadersInit` | -       | Default headers included in all requests (can be overridden per request)             |
| `searchParams`           | `URLSearchParams \| Record<string, string> \| string \| [string, string][]` | - | Default query/search params included in all requests (can be overridden per request) |
| `throwOnFetchError`      | `boolean`     | `true`  | Throw `FetchError` on non-2xx responses               |
| `throwOnValidationError` | `boolean`     | `true`  | Throw `ValidationError` on schema validation failures |

## URL Handling

### Relative URLs

Relative URLs are automatically prefixed with the `baseURL`:

```typescript
const { api } = createFetch({ baseURL: "https://api.example.com" });

// Fetches https://api.example.com/users
const users = await api.get("/users", UsersSchema);

// Leading slash is optional
const user = await api.get("users/1", UserSchema);
```

### Absolute URLs

Absolute URLs (starting with `http://`, `https://`, or `//`) ignore the `baseURL`:

```typescript
const { api } = createFetch({ baseURL: "https://api.example.com" });

// Fetches https://other-api.com/data (ignores baseURL)
const data = await api.get("https://other-api.com/data", DataSchema);
```

## Header Merging

Default headers from the factory are merged with per-request headers. Per-request headers take precedence:

```typescript
const { api } = createFetch({
  baseURL: "https://api.example.com",
  headers: {
    Authorization: "Bearer default-token",
    "Content-Type": "application/json",
  },
  searchParams: { locale: "en", page: "1" },
});

// This request will have:
// - Authorization: Bearer override-token (overridden)
// - Content-Type: application/json (from defaults)
// - X-Custom: value (new header)
const user = await api.get("/users/1", UserSchema, {
  headers: {
    Authorization: "Bearer override-token",
    "X-Custom": "value",
  },
  // per-request search params override factory defaults
  searchParams: { page: "2", q: "alex" },
});
```

## Multiple API Clients

You can create separate fetch instances for different APIs:

```typescript
import { createFetch } from "@zap-studio/fetch";

// GitHub API client
const github = createFetch({
  baseURL: "https://api.github.com",
  headers: { Authorization: "Bearer github-token" },
});

// Internal API client
const internal = createFetch({
  baseURL: "https://internal.example.com/api",
  headers: { "X-Internal-Key": "secret" },
});

// Stripe API client
const stripe = createFetch({
  baseURL: "https://api.stripe.com/v1",
  headers: { Authorization: "Bearer sk_test_..." },
});

// Use them independently
const repo = await github.api.get("/repos/owner/repo", RepoSchema);
const data = await internal.api.get("/data", DataSchema);
const customer = await stripe.api.get("/customers/cus_123", CustomerSchema);
```

## Configuring Error Behavior

You can configure default error throwing behavior at the factory level:

```typescript
// Never throw validation errors by default
const { api } = createFetch({
  baseURL: "https://api.example.com",
  throwOnValidationError: false,
});

// All requests will return Result objects instead of throwing
const result = await api.get("/users/1", UserSchema);

if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Success:", result.value);
}
```

You can still override this per-request:

```typescript
// Override to throw for this specific request
const user = await api.get("/users/1", UserSchema, {
  throwOnValidationError: true,
});
```

## Return Type

`createFetch` returns an object with both `$fetch` and `api`:

```typescript
const { $fetch, api } = createFetch({
  baseURL: "https://api.example.com",
});

// Use api.* for convenience methods
const user = await api.get("/users/1", UserSchema);

// Use $fetch for raw responses or more control
const response = await $fetch("/health");
console.log("Status:", response.status);
```
