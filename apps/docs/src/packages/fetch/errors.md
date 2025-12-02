# Error Handling

`@zap-studio/fetch` provides two specialized error classes for granular error handling: `FetchError` for HTTP errors and `ValidationError` for schema validation failures.

## Importing Error Classes

```typescript
import { FetchError, ValidationError } from "@zap-studio/fetch/errors";
```

## FetchError

Thrown when the HTTP response status is not ok (non-2xx status codes) and `throwOnFetchError` is `true` (default).

### Properties

| Property   | Type       | Description                    |
| ---------- | ---------- | ------------------------------ |
| `name`     | `string`   | Always `"FetchError"`          |
| `message`  | `string`   | Error message with status info |
| `status`   | `number`   | HTTP status code               |
| `response` | `Response` | The full Response object       |

### Example

```typescript
import { api } from "@zap-studio/fetch";
import { FetchError } from "@zap-studio/fetch/errors";

try {
  const user = await api.get("/api/users/999", UserSchema);
} catch (error) {
  if (error instanceof FetchError) {
    console.error(`HTTP Error ${error.status}: ${error.message}`);

    // Access the full response
    const body = await error.response.text();
    console.error("Response body:", body);

    // Handle specific status codes
    if (error.status === 404) {
      console.log("User not found");
    } else if (error.status === 401) {
      console.log("Unauthorized - please log in");
    }
  }
}
```

## ValidationError

Thrown when schema validation fails and `throwOnValidationError` is `true` (default).

### Properties

| Property  | Type                      | Description                           |
| --------- | ------------------------- | ------------------------------------- |
| `name`    | `string`                  | Always `"ValidationError"`            |
| `message` | `string`                  | JSON-formatted validation issues      |
| `issues`  | `StandardSchemaV1.Issue[]` | Array of validation issues            |

### Issue Structure

Each issue in the `issues` array follows the Standard Schema format:

```typescript
interface Issue {
  message: string;
  path?: PropertyKey[];
}
```

### Example

```typescript
import { api } from "@zap-studio/fetch";
import { ValidationError } from "@zap-studio/fetch/errors";

try {
  const user = await api.get("/api/users/1", UserSchema);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed!");

    for (const issue of error.issues) {
      const path = issue.path?.join(".") || "root";
      console.error(`  - ${path}: ${issue.message}`);
    }
  }
}
```

## Combined Error Handling

Handle both error types in a single try-catch:

```typescript
import { api } from "@zap-studio/fetch";
import { FetchError, ValidationError } from "@zap-studio/fetch/errors";

async function getUser(id: number) {
  try {
    return await api.get(`/api/users/${id}`, UserSchema);
  } catch (error) {
    if (error instanceof FetchError) {
      if (error.status === 404) {
        return null; // User not found
      }
      throw new Error(`API error: ${error.status}`);
    }

    if (error instanceof ValidationError) {
      console.error("Invalid response from API:", error.issues);
      throw new Error("API returned invalid data");
    }

    throw error; // Re-throw unexpected errors
  }
}
```

## Disabling Error Throwing

You can disable automatic error throwing to handle errors manually.

### Disabling FetchError

```typescript
const response = await $fetch("/api/users/999", {
  throwOnFetchError: false,
});

// Check status manually
if (!response.ok) {
  console.log("Request failed:", response.status);
}
```

### Disabling ValidationError

When disabled, validation returns a Result object instead of throwing:

```typescript
const result = await $fetch("/api/users/1", UserSchema, {
  throwOnValidationError: false,
});

if (result.issues) {
  // Validation failed
  console.error("Validation issues:", result.issues);
} else {
  // Validation succeeded
  console.log("User:", result.value);
}
```

### Result Type

When `throwOnValidationError` is `false`, the return type is a Standard Schema Result:

```typescript
type Result<T> = {
  value: T;
  issues?: undefined;
} | {
  value?: undefined;
  issues: Issue[];
};
```

## Error Handling Best Practices

1. **Always handle both error types** when making API calls
2. **Use specific error handlers** for different status codes
3. **Log validation issues** to help debug API response changes
4. **Consider disabling throws** for expected error cases (like 404s)
5. **Re-throw unexpected errors** to avoid silently swallowing issues
