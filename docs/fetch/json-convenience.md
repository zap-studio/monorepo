# JSON Convenience

The `json` option serializes the request body and sets `Content-Type`.

```ts
import { api } from "@zap-studio/fetch";

await api.post("/api/users", UserSchema, {
  json: { name: "Ada" },
});
```

`UserSchema` still validates the response — the `json` value is only the outgoing request body and is not validated by the schema.

## What It Sets

Providing `json` sets:

- `body` to `JSON.stringify(json)`
- `Content-Type` to `application/json`, when no content type is already set on `headers`

```ts
import { $fetch } from "@zap-studio/fetch";

const user = await $fetch("https://api.example.com/users", UserSchema, {
  method: "POST",
  json: { name: "Ada" },
});
```

## Mutually Exclusive with `body`

`json` and native `body` cannot be used together — providing both throws a `TypeError`.

```ts
await $fetch("/api/upload", {
  method: "POST",
  body: formData, // use native `body` for FormData, Blob, ReadableStream, etc.
});
```

## See Also

- [Validated Fetch Mode](validated-fetch-mode.md) — how the response schema and `json` interact.
- [HTTP Method Helpers](api-methods.md) — `api.post`, `api.put`, and `api.patch` examples.
- [Overview](README.md) — package summary and quick start.
