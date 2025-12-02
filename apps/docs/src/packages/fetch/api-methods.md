# API Methods

The `api` object provides convenient methods for common HTTP verbs. All methods require a schema for validation and return fully typed, validated data.

## Available Methods

### `api.get(url, schema, options?)`

Performs a GET request with schema validation.

```typescript
import { z } from "zod";
import { api } from "@zap-studio/fetch";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const user = await api.get("https://api.example.com/users/1", UserSchema);
// user is typed as { id: number; name: string; email: string; }
```

### `api.post(url, schema, options?)`

Performs a POST request. The `body` is automatically JSON-stringified and `Content-Type: application/json` header is set.

```typescript
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const newUser = await api.post("https://api.example.com/users", UserSchema, {
  body: {
    name: "John Doe",
    email: "john@example.com",
  },
});
// newUser is typed as { id: number; name: string; email: string; }
```

### `api.put(url, schema, options?)`

Performs a PUT request for full resource replacement.

```typescript
const updated = await api.put("https://api.example.com/users/1", UserSchema, {
  body: {
    name: "Jane Doe",
    email: "jane@example.com",
  },
});
```

### `api.patch(url, schema, options?)`

Performs a PATCH request for partial updates.

```typescript
const patched = await api.patch("https://api.example.com/users/1", UserSchema, {
  body: {
    email: "newemail@example.com",
  },
});
```

### `api.delete(url, schema, options?)`

Performs a DELETE request.

```typescript
const DeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const result = await api.delete("https://api.example.com/users/1", DeleteResponseSchema);
```

## Request Options

All methods accept an optional `options` parameter with the following properties:

| Option                   | Type                              | Default | Description                                           |
| ------------------------ | --------------------------------- | ------- | ----------------------------------------------------- |
| `body`                   | `BodyInit \| Record<string, unknown>` | -       | Request body (auto-stringified for objects)           |
| `headers`                | `HeadersInit`                     | -       | Request headers                                       |
| `throwOnFetchError`      | `boolean`                         | `true`  | Throw `FetchError` on non-2xx responses               |
| `throwOnValidationError` | `boolean`                         | `true`  | Throw `ValidationError` on schema validation failures |

Plus all standard [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) options.

## Example with Headers

```typescript
const user = await api.get("https://api.example.com/users/me", UserSchema, {
  headers: {
    Authorization: "Bearer your-token",
    "X-Custom-Header": "value",
  },
});
```

## Note on Raw Responses

The `api.*` methods always require a schema for validation. If you need raw responses without validation, use [`$fetch`](/packages/fetch/fetch-function) directly.
