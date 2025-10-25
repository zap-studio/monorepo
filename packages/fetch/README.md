# @zap-studio/fetch

A type-safe fetch wrapper with Zod validation for TypeScript.

## Features

- 🎯 **Type-safe requests** with automatic type inference
- 🛡️ **Runtime validation** using Zod schemas
- 🔄 **Automatic content-type** detection and handling
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

### `api.post(url, schema, body?, options?)`

```typescript
const newUser = await api.post("/api/users", UserSchema, {
  name: "John Doe",
  email: "john@example.com",
});
```

### `api.put(url, schema, body?, options?)`

```typescript
const updated = await api.put("/api/users/1", UserSchema, {
  name: "Jane Doe",
});
```

### `api.patch(url, schema, body?, options?)`

```typescript
const patched = await api.patch("/api/users/1", UserSchema, {
  email: "newemail@example.com",
});
```

### `api.delete(url, schema, options?)`

```typescript
const deleted = await api.delete("/api/users/1", UserSchema);
```

## Advanced Usage

### Using `safeFetch` directly

```typescript
import { safeFetch } from "@zap-studio/fetch";

const result = await safeFetch(
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
const text = await safeFetch(
  "/api/data",
  z.string(),
  { responseType: "text" }
);

// Get blob response
const blob = await safeFetch(
  "/api/file",
  z.instanceof(Blob),
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
const user = await safeFetch(url, UserSchema, {
  throwOnValidationError: true,
});

// Return validation result without throwing
const result = await safeFetch(url, UserSchema, {
  throwOnValidationError: false,
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

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
