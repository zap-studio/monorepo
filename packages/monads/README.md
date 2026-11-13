# @zap-studio/monads

`Result`/`Option` types and Rust-style functional combinators for explicit, type-safe error handling — an alternative to throw/catch and nullable checks.

Full documentation: [docs/monads](https://github.com/zap-studio/monorepo/tree/main/docs/monads)

## Installation

```bash
npm install @zap-studio/monads
```

## Quick Start

```ts
import { err, ok, pipe, Result } from "@zap-studio/monads";

function parseAge(input: string): Result<number, string> {
  const value = Number(input);
  return Number.isNaN(value) ? err("not a number") : ok(value);
}

const message = pipe(
  parseAge("42"),
  Result.map((age) => age + 1),
  Result.match({
    ok: (age) => `Age next year: ${age}`,
    err: (reason) => `Invalid input: ${reason}`,
  }),
);

pipe(
  parseAge("not a number"),
  Result.orElse(() => ok(0)),
); // Ok(0), recovered from Err
```

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0                                           |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package ships standard ESM only and uses no runtime-specific APIs. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/monads`).

## License

MIT
