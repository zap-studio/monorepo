# Validation

`@zap-studio/fetch` uses [Standard Schema](https://standardschema.dev/) for runtime validation, which means it works with any schema library that implements the Standard Schema specification.

## Supported Schema Libraries

Any library implementing Standard Schema v1 is supported, including:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)
- [TypeBox](https://github.com/sinclairzx81/typebox)
- And more...

## Using Different Schema Libraries

### Zod

```typescript
import { z } from "zod";
import { api } from "@zap-studio/fetch";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

const user = await api.get("/users/1", UserSchema);
```

### Valibot

```typescript
import * as v from "valibot";
import { api } from "@zap-studio/fetch";

const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
});

const user = await api.get("/users/1", UserSchema);
```

### ArkType

```typescript
import { type } from "arktype";
import { api } from "@zap-studio/fetch";

const UserSchema = type({
  id: "number",
  name: "string",
  email: "email",
  createdAt: "string",
});

const user = await api.get("/users/1", UserSchema);
```

## The standardValidate Helper

For standalone validation needs, you can use the `standardValidate` helper function:

```typescript
import { standardValidate } from "@zap-studio/fetch/validator";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Throwing validation (default)
const user = await standardValidate(UserSchema, data, true);
// Returns validated data or throws ValidationError

// Non-throwing validation
const result = await standardValidate(UserSchema, data, false);
// Returns { value: T } or { issues: Issue[] }

if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Valid user:", result.value);
}
```

## isStandardSchema Type Guard

Check if a value is a Standard Schema:

```typescript
import { isStandardSchema } from "@zap-studio/fetch/validator";

const schema = z.object({ name: z.string() });

if (isStandardSchema(schema)) {
  // TypeScript knows schema is StandardSchemaV1
  const result = schema["~standard"].validate(data);
}
```

## Validation Flow

When you pass a schema to `$fetch` or `api.*` methods:

1. The HTTP request is made
2. The response JSON is parsed
3. The data is validated against your schema
4. If valid, the typed data is returned
5. If invalid and `throwOnValidationError: true`, a `ValidationError` is thrown
6. If invalid and `throwOnValidationError: false`, a Result object is returned

```typescript
// Simplified internal flow
const response = await fetch(url, options);
const rawData = await response.json();
const validatedData = await standardValidate(schema, rawData, throwOnValidationError);
return validatedData;
```

## Handling Validation Results

### Throwing Mode (Default)

```typescript
import { ValidationError } from "@zap-studio/fetch/errors";

try {
  const user = await api.get("/users/1", UserSchema);
  // user is fully typed: { id: number; name: string; email: string; }
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    for (const issue of error.issues) {
      console.error(`${issue.path?.join(".")}: ${issue.message}`);
    }
  }
}
```

### Non-Throwing Mode

```typescript
const result = await api.get("/users/1", UserSchema, {
  throwOnValidationError: false,
});

if (result.issues) {
  // Handle validation failure
  result.issues.forEach((issue) => {
    console.error(`${issue.path?.join(".")}: ${issue.message}`);
  });
} else {
  // Use validated data
  console.log("User name:", result.value.name);
}
```

## Type Inference

Types are automatically inferred from your schema:

```typescript
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  roles: z.array(z.enum(["admin", "user"])),
});

const user = await api.get("/users/1", UserSchema);
// TypeScript infers:
// {
//   id: number;
//   name: string;
//   email: string;
//   roles: ("admin" | "user")[];
// }
```

## Best Practices

1. **Define schemas once, reuse everywhere** - Create schema files for your API types
2. **Use strict schemas** - Validate exactly what you expect from the API
3. **Handle validation errors gracefully** - APIs can change unexpectedly
4. **Consider non-throwing mode** - For expected variations in API responses
5. **Use schema transforms** - Parse dates, numbers, etc. directly in your schema

### Schema Organization Example

```typescript
// schemas/user.ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().transform((s) => new Date(s)),
});

export type User = z.infer<typeof UserSchema>;

// api/users.ts
import { api } from "@/lib/fetch";
import { UserSchema, type User } from "@/schemas/user";

export async function getUser(id: number): Promise<User> {
  return api.get(`/users/${id}`, UserSchema);
}
```
