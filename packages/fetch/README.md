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
- 📦 **Multiple response types** (JSON, text, blob, arrayBuffer)
- 🚨 **Custom error handling** with FetchError class
- 📘 **Full TypeScript support** with zero configuration

## Installation

```bash
pnpm add @zap-studio/fetch
#or
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
const user = await api.get(
  "https://api.example.com/users/1",
  UserSchema
);

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
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
  }),
  headers: {
    "Content-Type": "application/json",
  },
});
```

### `api.put(url, schema, options?)`

```typescript
const updated = await api.put("/api/users/1", UserSchema, {
  body: JSON.stringify({ name: "Jane Doe" }),
  headers: { "Content-Type": "application/json" },
});
```

### `api.patch(url, schema, options?)`

```typescript
const patched = await api.patch("/api/users/1", UserSchema, {
  body: JSON.stringify({ email: "newemail@example.com" }),
  headers: { "Content-Type": "application/json" },
});
```

### `api.delete(url, schema, options?)`

```typescript
const deleted = await api.delete("/api/users/1", UserSchema);
```

## Advanced Usage

### Using `$fetch` directly

```typescript
import { $fetch } from "@zap-studio/fetch";

const result = await $fetch(
  "https://api.example.com/users/1",
  UserSchema,
  {
    method: "GET",
    headers: {
      "Authorization": "Bearer token",
    },
  }
);
```

### Custom response types

```typescript
// Get text response
const text = await $fetch(
  "/api/data",
  z.string(), // Schema is ignored for non-json responses but required by type definition
  { responseType: "text" }
);

// Get blob response
const blob = await $fetch(
  "/api/file",
  z.any(),
  { responseType: "blob" }
);
```

### Error handling

```typescript
import { FetchError } from "@zap-studio/fetch/errors";

try {
  const user = await api.get("/api/users/1", UserSchema);
} catch (error) {
  if (error instanceof FetchError) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
  }
}
```

### Flexible validation

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


