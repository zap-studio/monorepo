# Standard Schema

`webhooks` validates route payloads through [Standard Schema](https://github.com/standard-schema/standard-schema), so it works with any compatible validation library — bring Zod, Valibot, ArkType, or any other Standard Schema implementation.

```ts
import { createWebhookRouter } from "@zap-studio/webhooks";

const router = createWebhookRouter();
```

**Zod**

```ts
import { z } from "zod";

router.register("/event", {
  schema: z.object({ id: z.string() }),
  handler: ({ payload }) => Response.json(payload),
});
```

**Valibot**

```ts
import * as v from "valibot";

router.register("/event", {
  schema: v.object({ id: v.string() }),
  handler: ({ payload }) => Response.json(payload),
});
```

**ArkType**

```ts
import { type } from "arktype";

router.register("/event", {
  schema: type({ id: "string" }),
  handler: ({ payload }) => Response.json(payload),
});
```

When those libraries implement the Standard Schema spec, you keep one validation flow across your app instead of writing library-specific request handling.

## See Also

- [Type-Safe Routing](type-safe-routing.md)
