# Conditions

Conditions are the building blocks for creating complex authorization rules. `@zap-studio/permit` provides combinators to compose simple conditions into powerful, readable policies.

## Understanding Conditions

A condition is a function that evaluates to `true` or `false`:

```typescript
type ConditionFn<TContext, TAction, TResource> = (
  context: TContext,
  action: TAction,
  resource: TResource
) => boolean;
```

Conditions are used with `when()` to create policy rules:

```typescript
when((ctx, action, resource) => /* condition logic */)
```

## Condition Combinators

### and()

The `and()` combinator creates a condition that passes only when **all** conditions are true. It short-circuits on the first `false` value.

```typescript
import { and } from "@zap-studio/permit";

and(...conditions)
```

#### Example: Multiple Requirements

```typescript
import { createPolicy, when, and } from "@zap-studio/permit";

// User must be authenticated AND be the owner AND post must be published
const canEditPublishedPost = and(
  (ctx) => ctx.user !== null,
  (ctx, _, post) => ctx.user?.id === post.authorId,
  (_, __, post) => post.status === "published"
);

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      edit: when(canEditPublishedPost),
    },
  },
});
```

### or()

The `or()` combinator creates a condition that passes when **any** condition is true. It short-circuits on the first `true` value.

```typescript
import { or } from "@zap-studio/permit";

or(...conditions)
```

#### Example: Multiple Access Paths

```typescript
import { createPolicy, when, or } from "@zap-studio/permit";

// User can access if they're the owner OR an admin OR explicitly shared
const canAccess = or(
  (ctx, _, doc) => ctx.user?.id === doc.ownerId,
  (ctx) => ctx.user?.role === "admin",
  (ctx, _, doc) => doc.sharedWith.includes(ctx.user?.id ?? "")
);

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    document: {
      read: when(canAccess),
    },
  },
});
```

### not()

The `not()` combinator negates a condition.

```typescript
import { not } from "@zap-studio/permit";

not(condition)
```

#### Example: Exclusion Rules

```typescript
import { createPolicy, when, not, and } from "@zap-studio/permit";

// Cannot interact with your own content
const isNotOwner = not((ctx, _, resource) => ctx.user?.id === resource.authorId);

// Content is not archived
const isNotArchived = not((_, __, resource) => resource.status === "archived");

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      // Can like any post except your own
      like: when(isNotOwner),

      // Can comment on posts that aren't archived
      comment: when(isNotArchived),

      // Can report posts that: you don't own AND aren't already reported by you
      report: when(
        and(
          isNotOwner,
          (ctx, _, post) => !post.reportedBy.includes(ctx.user?.id ?? "")
        )
      ),
    },
  },
});
```

### has()

The `has()` helper creates a condition that checks if a context property equals a specific value.

```typescript
import { has } from "@zap-studio/permit";

has(key, value)
```

#### Example: Simple Property Checks

```typescript
import { createPolicy, when, has, or } from "@zap-studio/permit";

type AppContext = {
  role: "guest" | "user" | "admin";
  isVerified: boolean;
  plan: "free" | "pro" | "enterprise";
};

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    settings: {
      // Only admins can access settings
      read: when(has("role", "admin")),
    },
    billing: {
      // Only verified users can access billing
      read: when(has("isVerified", true)),
    },
    export: {
      // Pro or Enterprise users can export
      use: when(or(has("plan", "pro"), has("plan", "enterprise"))),
    },
  },
});
```

## Combining Combinators

Combinators can be nested to create complex conditions:

```typescript
import { createPolicy, when, and, or, not } from "@zap-studio/permit";

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    document: {
      // Can edit if:
      // (owner OR admin) AND (not archived) AND (not locked OR is admin)
      edit: when(
        and(
          or(
            (ctx, _, doc) => ctx.user?.id === doc.ownerId,
            (ctx) => ctx.user?.role === "admin"
          ),
          not((_, __, doc) => doc.status === "archived"),
          or(
            not((_, __, doc) => doc.isLocked),
            (ctx) => ctx.user?.role === "admin"
          )
        )
      ),
    },
  },
});
```

## Extracting Reusable Conditions

For cleaner code, extract conditions into named functions:

```typescript
import { and, or, not } from "@zap-studio/permit";
import type { ConditionFn } from "@zap-studio/permit/types";

type DocContext = {
  user: { id: string; role: string } | null;
};

type Document = {
  ownerId: string;
  status: string;
  isLocked: boolean;
};

// Reusable conditions
const isOwner: ConditionFn<DocContext, string, Document> = (ctx, _, doc) =>
  ctx.user?.id === doc.ownerId;

const isAdmin: ConditionFn<DocContext, string, Document> = (ctx) =>
  ctx.user?.role === "admin";

const isArchived: ConditionFn<DocContext, string, Document> = (_, __, doc) =>
  doc.status === "archived";

const isLocked: ConditionFn<DocContext, string, Document> = (_, __, doc) =>
  doc.isLocked;

// Composed conditions
const canEdit = and(
  or(isOwner, isAdmin),
  not(isArchived),
  or(not(isLocked), isAdmin)
);

// Use in policy
const policy = createPolicy<DocContext>({
  resources,
  actions,
  rules: {
    document: {
      edit: when(canEdit),
    },
  },
});
```

## Best Practices

1. **Name your conditions** — Extract complex logic into well-named functions
2. **Keep conditions simple** — Each condition should check one thing
3. **Use short-circuit evaluation** — Put fast/common checks first in `and()`/`or()`
4. **Avoid side effects** — Conditions should be pure functions
5. **Document complex logic** — Add comments explaining business rules
