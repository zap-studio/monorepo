# Policy Rules

Policy rules are functions that determine whether an action is allowed or denied. `@zap-studio/permit` provides three rule builders: `allow()`, `deny()`, and `when()`.

## Understanding Rules

Every rule in your policy must return a **decision**: either `"allow"` or `"deny"`. Rules receive three arguments:

1. **context** — The current user/request context
2. **action** — The action being performed (e.g., "read", "write")
3. **resource** — The resource being accessed

## allow()

The `allow()` function creates a rule that always permits the action, regardless of context or resource.

```typescript
import { allow } from "@zap-studio/permit";
```

### When to Use

Use `allow()` for actions that should be available to everyone:

- Public content (published blog posts, product listings)
- Health check endpoints
- Public API documentation

### Example: Public Content

```typescript
import { createPolicy, allow, when } from "@zap-studio/permit";

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      // Anyone can read posts (we'll refine this with conditions later)
      read: allow(),
    },
    documentation: {
      // API docs are always public
      read: allow(),
    },
  },
});
```

## deny()

The `deny()` function creates a rule that always blocks the action. No context or resource can override this.

```typescript
import { deny } from "@zap-studio/permit";
```

### When to Use

Use `deny()` for:

- Temporarily disabled features
- Actions reserved for future implementation
- Hard blocks that should never be bypassed

### Example: Disabled Features

```typescript
import { createPolicy, allow, deny, when } from "@zap-studio/permit";

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      read: allow(),
      write: when((ctx, _, post) => ctx.user?.id === post.authorId),
      // Permanently archived posts cannot be deleted
      delete: deny(),
    },
    legacyFeature: {
      // This feature is deprecated and disabled
      use: deny(),
    },
  },
});
```

## when()

The `when()` function creates a conditional rule. It takes a condition function and allows the action only if the condition returns `true`.

```typescript
import { when } from "@zap-studio/permit";

when((context, action, resource) => boolean)
```

### Condition Function

The condition function receives:

| Parameter  | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `context`  | `TContext` | Current user/request context   |
| `action`   | `string` | The action being performed     |
| `resource` | `TResource` | The resource being accessed    |

It must return a `boolean`:
- `true` → action is allowed
- `false` → action is denied

### Example: Owner-Only Access

```typescript
import { createPolicy, when } from "@zap-studio/permit";

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      // Only the author can edit their post
      write: when((ctx, _, post) => ctx.user?.id === post.authorId),

      // Only the author can delete their post
      delete: when((ctx, _, post) => ctx.user?.id === post.authorId),
    },
  },
});
```

## Using the Action Parameter

The `action` parameter becomes useful when you create reusable condition functions that handle multiple actions differently. This lets you share logic across actions while still customizing behavior:

```typescript
import { createPolicy, when } from "@zap-studio/permit";
import type { ConditionFn } from "@zap-studio/permit/types";

type PostAction = "read" | "write" | "delete";
type Post = { id: string; authorId: string; visibility: "public" | "private" };

// Reusable condition that behaves differently based on action
const canAccessPost: ConditionFn<AppContext, PostAction, Post> = (ctx, action, post) => {
  // Anyone can read public posts
  if (action === "read" && post.visibility === "public") {
    return true;
  }

  // For write/delete (or private reads), must be the author
  return ctx.user?.id === post.authorId;
};

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      // Same function handles all three actions with different logic
      read: when(canAccessPost),
      write: when(canAccessPost),
      delete: when(canAccessPost),
    },
  },
});
```

This pattern is useful when actions share similar logic but need slight variations—you define the condition once and reuse it across multiple actions.

## Combining Rules

Rules can be combined with condition combinators. See the [Conditions](/packages/permit/conditions) page for details on using `and()`, `or()`, and `not()`.

## Best Practices

1. **Start restrictive** — Use `deny()` as the default, then explicitly allow
2. **Keep conditions pure** — Don't perform side effects in condition functions
3. **Avoid async operations** — Conditions must be synchronous; fetch data before checking
4. **Use descriptive variable names** — `isOwner`, `isMember`, `hasAccess`
5. **Extract complex conditions** — Create reusable condition functions for clarity
