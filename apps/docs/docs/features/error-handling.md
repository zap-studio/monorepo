# Error Handling

Building reliable apps isn't just about making things _work_. It’s about making sure things **fail gracefully** when they don’t. That’s where [Effect](https://effect.website) comes in — a modern, composable effect system for TypeScript and JavaScript — aligning with Zap.ts' philosophy.

## Why use Effect?

Most people sprinkle `try/catch` or `.catch()` throughout their code — and it works… until it doesn’t. You end up with inconsistent _error handling_, _unreadable logic_, and _debugging nightmares_.

**Effect** fixes that by giving you:

- **Better testability** — effects are easy to simulate/mock
- **Composable** workflows — you can chain logic clearly
- **Explicit** error handling — no hidden surprises
- **Type-safe** async code — TypeScript actually helps you

Instead of letting errors blow up in random places, you model them as data. That makes your app’s behavior predictable and easier to reason about.

## A simple example

Here’s how you’d wrap an async API call using `Effect.tryPromise`, it's pretty similar to what you already know.

```ts
import { Effect } from "effect";

const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    catch: (err) => err,
  });

Effect.runPromise(fetchUser("123"))
  .then((user) => {
    // handle user
  })
  .catch((error) => {
    // handle error
  });
```

`Effect.tryPromise` lets you safely **run async code** without random crashes. Everything is **_contained_** and **_type-checked_**.

## Handling Errors Declaratively

You can also _cleanly_ handle errors as part of your logic, without nested `.then()`s or `try/catch` blocks. Here’s how:

```ts
import { Effect } from "effect";

const safeFetch = fetchUser("123").pipe(
  Effect.catchAll((error) => Effect.succeed({ error }))
);

Effect.runPromise(safeFetch).then((result) => {
  if ("error" in result) {
    // handle error
  } else {
    // handle success
  }
});
```

What’s happening here? Let's try to understand the above code.

1. You try to fetch the user.
2. If it fails, you catch the error and return it as a regular value.
3. Now everything — success and failure — is part of the same flow.
4. No surprises, no runtime crashes.

## Utility Classes

Zap.ts includes pre-built error classes in `src/lib/effect.ts` to help you get started quickly:

```ts
import { Data } from 'effect';

export class DatabaseFetchError extends Data.TaggedError(
  'DatabaseFetchError'
) {}
```

These utility classes follow Effect's patterns for creating **tagged errors** — making it easy to distinguish between different error types in your application. You can import and use them directly:

```ts
import { Effect } from 'effect';
import { DatabaseFetchError } from '@/lib/effect';

const fetchUserFromDb = (id: string) =>
  Effect.tryPromise({
    try: () => db.user.findUnique({ where: { id } }),
    catch: () => new DatabaseFetchError(),
  });
```

This approach gives you **type-safe error handling** where you can pattern match on specific error types rather than dealing with generic `Error` objects.

## Learn More

We recommend you to check the [Effect Documentation](https://effect.website/docs) to learn more. While it can be a **_mind shift_**, once you get it, your code will be _way more_ predictable.