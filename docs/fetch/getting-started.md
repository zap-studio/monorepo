# Getting Started

Install @zap-studio/fetch and make your first validated request.

## Installation

```bash
# npm
npm install @zap-studio/fetch
# yarn
yarn add @zap-studio/fetch
# pnpm
pnpm add @zap-studio/fetch
# bun
bun add @zap-studio/fetch
# deno
deno add jsr:@zap-studio/fetch
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/schema), such as Zod, Valibot, or ArkType. The examples below use Zod.

## Make Your First Request

Define a schema for the response shape, then pass it to `api.get`.

```ts
import { api } from "@zap-studio/fetch";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});

const user = await api.get("https://api.example.com/users/1", UserSchema);

console.log(user.name); // typed as string, validated at runtime
```

The response is parsed and validated at runtime, and `user` is typed from `UserSchema` — no manual type annotations or `as` casts.

## Handle Errors

`api.get` throws `FetchError` for non-2xx responses and `ValidationError` when the response doesn't match the schema.

```ts
import { FetchError } from "@zap-studio/fetch";
import { ValidationError } from "@zap-studio/validation";

try {
  const user = await api.get("https://api.example.com/users/1", UserSchema);
  console.log(user);
} catch (error) {
  if (error instanceof FetchError) console.error(error.status);
  if (error instanceof ValidationError) console.error(error.issues);
}
```

> [!NOTE]
> See [Structured Errors](errors.md) for the full error reference.

## Next Steps

- [Raw Fetch Mode](raw-fetch-mode.md) — skip validation, get the native `Response`.
- [HTTP Method Helpers](api-methods.md) — `api.post`, `api.put`, `api.patch`, `api.delete`.
- [Configured Clients](create-fetch.md) — share a `baseURL` and headers with `createFetch`.
