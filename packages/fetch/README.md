# @zap-studio/fetch

A type-safe fetch wrapper with Standard Schema validation.

## Why @zap-studio/fetch?

**Before:**

```typescript
const response = await fetch("/api/users/1");
const data = await response.json();
const user = data as User; // 😱 Unsafe type assertion
```

**After:**

```typescript
const user = await api.get("/api/users/1", UserSchema);
// ✨ Typed, validated, and safe!
```

## Features

- 🎯 **Type-safe requests** with automatic type inference
- 🛡️ **Runtime validation** using Standard Schema (Zod, Valibot, ArkType, etc.)
- ⚡️ **Convenient API methods** (GET, POST, PUT, PATCH, DELETE)
- 🏭 **Factory pattern** for creating pre-configured instances with base URLs
- 🚨 **Custom error handling** with FetchError and ValidationError classes
- 📘 **Full TypeScript support** with zero configuration

## Installation

```bash
pnpm add @zap-studio/fetch
# or
npm install @zap-studio/fetch
```

## Quick Start

```typescript
import { z } from "zod";
import { api } from "@zap-studio/fetch";

// Define your schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});

// Make a type-safe request
const user = await api.get("https://api.example.com/users/1", UserSchema);

// user is fully typed and validated! ✨
console.log(user.name); // TypeScript knows this is a string
```

## API

### `api.get(url, schema, options?)`

```typescript
const user = await api.get("/api/users/1", UserSchema);
```

### `api.post(url, schema, options?)`

```typescript
const newUser = await api.post("/api/users", UserSchema, {
  body: {
    name: "John Doe",
    email: "john@example.com",
  },
});
// Automatically stringifies body and sets Content-Type: application/json
```

### `api.put(url, schema, options?)`

```typescript
const updated = await api.put("/api/users/1", UserSchema, {
  body: { name: "Jane Doe" },
});
```

### `api.patch(url, schema, options?)`

```typescript
const patched = await api.patch("/api/users/1", UserSchema, {
  body: { email: "newemail@example.com" },
});
```

### `api.delete(url, schema, options?)`

```typescript
const deleted = await api.delete("/api/users/1", UserSchema);
```

> **Note:** The `api.*` methods always require a schema for validation. For raw responses without validation, use `$fetch` directly.

## Advanced Usage

### Using `$fetch` directly

For more control or when you don't need schema validation:

```typescript
import { $fetch } from "@zap-studio/fetch";

// With schema validation
const user = await $fetch("https://api.example.com/users/1", UserSchema, {
  method: "GET",
  headers: {
    Authorization: "Bearer token",
  },
});

// Without schema - returns raw Response object
const response = await $fetch("https://api.example.com/users/1", {
  method: "GET",
});
const data = await response.json();
```

### Factory Pattern with `createFetch`

Create pre-configured fetch instances with base URLs and default headers. Useful for API clients:

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

#### Factory Options

| Option                   | Type          | Default | Description                                      |
| ------------------------ | ------------- | ------- | ------------------------------------------------ |
| `baseURL`                | `string`      | `""`    | Base URL prepended to all requests               |
| `headers`                | `HeadersInit` | -       | Default headers included in all requests         |
| `throwOnFetchError`      | `boolean`     | `true`  | Throw `FetchError` on non-2xx responses          |
| `throwOnValidationError` | `boolean`     | `true`  | Throw `ValidationError` on schema validation failures |

#### Multiple API Clients

You can create separate fetch instances for different APIs:

```typescript
import { createFetch } from "@zap-studio/fetch";

// GitHub API client
const github = createFetch({
  baseURL: "https://api.github.com",
  headers: { Authorization: "Bearer github-token" },
});

// Your internal API client
const internal = createFetch({
  baseURL: "https://internal.example.com/api",
  headers: { "X-Internal-Key": "secret" },
});

// Use them independently
const repo = await github.api.get("/repos/owner/repo", RepoSchema);
const data = await internal.api.get("/data", DataSchema);
```

### Error Handling

The package exports specialized error classes for granular error handling:

```typescript
import { $fetch } from "@zap-studio/fetch";
import { FetchError, ValidationError } from "@zap-studio/fetch/errors";

try {
  const user = await api.get("/api/users/1", UserSchema);
} catch (error) {
  if (error instanceof FetchError) {
    console.error(`HTTP ${error.status}: ${error.response.statusText}`);
  }
  if (error instanceof ValidationError) {
    console.error("Validation failed:", error.issues);
  }
}
```

### Flexible Validation

You can choose whether validation errors should throw exceptions:

```typescript
// Throw on validation error (default)
const user = await $fetch(url, UserSchema, {
  throwOnValidationError: true,
});

// Return validation result without throwing
const result = await $fetch(url, UserSchema, {
  throwOnValidationError: false,
});

if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Success:", result.value);
}
```
