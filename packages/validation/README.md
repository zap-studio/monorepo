# @zap-studio/validation

Utilities for validating values using the [**Standard Schema**](https://standardschema.dev/schema) specification.

Full documentation: [docs/validation](https://github.com/zap-studio/monorepo/tree/main/docs/validation)

## Installation

```bash
npm install @zap-studio/validation
```

## Quick Start

```ts
import { standardValidate } from "@zap-studio/validation";

// `userSchema` can come from any Standard Schema-compatible library
try {
  const user = await standardValidate(input, userSchema, {
    throwOnError: true,
  });

  console.log("Validation passed:", user);
} catch (error) {
  console.error("Validation failed:", error);
}
```

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0                                           |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package ships standard ESM only and uses no runtime-specific APIs. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/validation`).

## License

MIT
