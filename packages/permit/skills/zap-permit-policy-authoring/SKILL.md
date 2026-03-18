---
name: zap-permit-policy-authoring
description: >
  Author typed authorization policies with @zap-studio/permit using
  createPolicy, allow/deny/when, condition combinators, has/hasRole,
  and mergePolicies vs mergePoliciesAny decision strategies.
type: core
library: "@zap-studio/permit"
library_version: "0.2.1"
sources:
  - "zap-studio/monorepo:packages/permit/README.md"
  - "zap-studio/monorepo:packages/permit/src/index.ts"
  - "zap-studio/monorepo:packages/permit/src/types.ts"
---

# @zap-studio/permit — Policy Authoring

## Setup

```ts
import { z } from "zod";
import { createPolicy, allow, when } from "@zap-studio/permit";
import type { Resources, Actions } from "@zap-studio/permit/types";

const resources = {
  post: z.object({ id: z.string(), authorId: z.string() }),
} satisfies Resources;

const actions = {
  post: ["read", "write"],
} as const satisfies Actions<typeof resources>;

type AppContext = { user: { id: string; role: "user" | "admin" } };

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      read: allow(),
      write: when((ctx, _action, post) => ctx.user.id === post.authorId),
    },
  },
});
```

## Core Patterns

### Compose conditions with `and`, `or`, and `not`

```ts
import { when, and, or, not } from "@zap-studio/permit";

const canEdit = when(
  and(
    (ctx, _action, post) => ctx.user.id === post.authorId,
    not((_ctx, _action, post) => post.locked === true),
  ),
);

const canRead = when(
  or(
    (_ctx, _action, post) => post.visibility === "public",
    (ctx, _action, post) => ctx.user.id === post.authorId,
  ),
);
```

### Add role inheritance checks with `hasRole`

```ts
import { when, hasRole } from "@zap-studio/permit";

const hierarchy = {
  guest: [],
  user: ["guest"],
  admin: ["user"],
} as const;

const adminOnly = when(hasRole("admin", hierarchy));
```

### Choose merge strategy explicitly

```ts
import { mergePolicies, mergePoliciesAny } from "@zap-studio/permit";

const strict = mergePolicies(basePolicy, tenantPolicy); // all must allow
const permissive = mergePoliciesAny(basePolicy, temporaryOverridePolicy); // any can allow
```

## Common Mistakes

### HIGH Using action missing from actions map

Wrong:

```ts
await policy.can(ctx, "publish", "post", post);
```

Correct:

```ts
const actions = {
  post: ["read", "write", "publish"],
} as const;

await policy.can(ctx, "publish", "post", post);
```

`can()` first checks `actions[resourceType]`; missing actions always resolve to `false`.

Source: zap-studio/monorepo:packages/permit/src/index.ts

### HIGH Assuming invalid resources still hit rule function

Wrong:

```ts
await policy.can(ctx, "write", "post", { id: 123 } as any);
```

Correct:

```ts
await policy.can(ctx, "write", "post", {
  id: "123",
  authorId: ctx.user.id,
});
```

Resource validation runs before policy evaluation; invalid payloads short-circuit to deny.

Source: zap-studio/monorepo:packages/permit/src/index.ts

### MEDIUM Expecting `mergePoliciesAny` to enforce deny-overrides

Wrong:

```ts
const merged = mergePoliciesAny(basePolicy, restrictivePolicy);
// expecting restrictivePolicy to always win
```

Correct:

```ts
const merged = mergePolicies(basePolicy, restrictivePolicy);
// deny-overrides behavior
```

`mergePoliciesAny` returns allowed when any policy allows; use `mergePolicies` for strict composition.

Source: zap-studio/monorepo:packages/permit/src/index.ts

See also: zap-validation-standard-schema/SKILL.md — invalid resource payload behavior.
