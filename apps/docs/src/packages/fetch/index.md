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
  email: z.string().email(),
});

// Make a type-safe request
const user = await api.get("https://api.example.com/users/1", UserSchema);

// user is fully typed and validated! ✨
console.log(user.name); // TypeScript knows this is a string
```

## What's Next?

- [API Methods](/packages/fetch/api-methods) - Learn about GET, POST, PUT, PATCH, DELETE
- [Using $fetch](/packages/fetch/fetch-function) - Direct fetch usage with and without validation
- [Factory Pattern](/packages/fetch/create-fetch) - Create pre-configured instances
- [Error Handling](/packages/fetch/errors) - Handle HTTP and validation errors
- [Validation](/packages/fetch/validation) - Deep dive into schema validation
