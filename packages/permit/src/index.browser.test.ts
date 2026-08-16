import type { Logger } from "@zap-studio/logger";
import type { StandardSchemaV1 } from "@zap-studio/validation";
import { describe, expect, it, vi } from "vitest";

import { PolicyError } from "./errors.js";
import {
  allow,
  and,
  collectInheritedRoles,
  createPolicy,
  deny,
  has,
  hasRole,
  mergePoliciesAnd,
  mergePoliciesOr,
  not,
  or,
  when,
} from "./index.js";
import type { Actions, Resources, RoleHierarchy } from "./types.js";

const createRecordingLogger = (): Logger & {
  calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[];
} => {
  const calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[] = [];
  const record =
    (level: string) =>
    (message: string, context?: Record<string, unknown>): void => {
      calls.push({ context, level, message });
    };

  return {
    calls,
    debug: record("debug"),
    error: record("error"),
    fatal: record("fatal"),
    info: record("info"),
    trace: record("trace"),
    warn: record("warn"),
  };
};

// Helper to create a mock Standard Schema
function createSchema<T>(): StandardSchemaV1<T, T> {
  return {
    "~standard": {
      validate: (value: unknown) => ({ value: value as T }),
      vendor: "test",
      version: 1,
    },
  };
}

// Test resource types
interface Post {
  authorId: string;
  id: string;
  status: "draft" | "published";
  visibility: "public" | "private";
}

interface Comment {
  authorId: string;
  id: string;
  postId: string;
}

// Test resources using mock Standard Schema
const resources = {
  comment: createSchema<Comment>(),
  post: createSchema<Post>(),
} satisfies Resources;

// Test actions
const actions = {
  comment: ["read", "write", "delete"],
  post: ["read", "write", "delete", "publish"],
} as const satisfies Actions<typeof resources>;

// Test context type
interface TestContext {
  user: {
    id: string;
    role: "guest" | "user" | "admin";
  };
}

describe(allow, () => {
  it("should return a function that always returns 'allow'", async () => {
    await Promise.resolve();
    const policyFn = allow();

    expect(policyFn({}, "read", {})).toBe("allow");
  });

  it("should ignore context, action, and resource", async () => {
    await Promise.resolve();
    const policyFn = allow<TestContext>();

    expect(
      policyFn({ user: { id: "1", role: "guest" } }, "write", { id: "1" })
    ).toBe("allow");
    expect(
      policyFn({ user: { id: "2", role: "admin" } }, "delete", { id: "2" })
    ).toBe("allow");
  });

  it("should work with any context type", async () => {
    await Promise.resolve();
    const policyFn = allow<{ custom: number }>();

    expect(policyFn({ custom: 42 }, "action", null)).toBe("allow");
  });
});

describe(deny, () => {
  it("should return a function that always returns 'deny'", async () => {
    await Promise.resolve();
    const policyFn = deny();

    expect(policyFn({}, "read", {})).toBe("deny");
  });

  it("should ignore context, action, and resource", async () => {
    await Promise.resolve();
    const policyFn = deny<TestContext>();

    expect(
      policyFn({ user: { id: "1", role: "admin" } }, "read", { id: "1" })
    ).toBe("deny");
    expect(
      policyFn({ user: { id: "2", role: "guest" } }, "write", { id: "2" })
    ).toBe("deny");
  });

  it("should work with any context type", async () => {
    await Promise.resolve();
    const policyFn = deny<{ custom: string }>();

    expect(policyFn({ custom: "test" }, "action", null)).toBe("deny");
  });
});

describe(when, () => {
  it("should return 'allow' when condition returns true", async () => {
    await Promise.resolve();
    const policyFn = when(() => true);

    expect(policyFn({}, "read", {})).toBe("allow");
  });

  it("should return 'deny' when condition returns false", async () => {
    await Promise.resolve();
    const policyFn = when(() => false);

    expect(policyFn({}, "read", {})).toBe("deny");
  });

  it("should pass context to the condition", async () => {
    await Promise.resolve();
    const policyFn = when<TestContext>((ctx) => ctx.user.role === "admin");

    expect(policyFn({ user: { id: "1", role: "admin" } }, "read", {})).toBe(
      "allow"
    );
    expect(policyFn({ user: { id: "1", role: "guest" } }, "read", {})).toBe(
      "deny"
    );
  });

  it("should pass action to the condition", async () => {
    await Promise.resolve();
    const policyFn = when<TestContext, "read" | "write">(
      (_ctx, action) => action === "read"
    );

    expect(policyFn({ user: { id: "1", role: "user" } }, "read", {})).toBe(
      "allow"
    );
    expect(policyFn({ user: { id: "1", role: "user" } }, "write", {})).toBe(
      "deny"
    );
  });

  it("should pass resource to the condition", async () => {
    await Promise.resolve();
    interface AuthoredPost {
      authorId: string;
    }
    const policyFn = when<TestContext, string, AuthoredPost>(
      (ctx, _action, resource) => ctx.user.id === resource.authorId
    );

    expect(
      policyFn({ user: { id: "user-1", role: "user" } }, "write", {
        authorId: "user-1",
      })
    ).toBe("allow");
    expect(
      policyFn({ user: { id: "user-1", role: "user" } }, "write", {
        authorId: "user-2",
      })
    ).toBe("deny");
  });
});

describe(and, () => {
  it("should return true when all conditions are true", async () => {
    await Promise.resolve();
    const condition = and(
      () => true,
      () => true,
      () => true
    );

    expect(condition({}, "read", {})).toBeTruthy();
  });

  it("should return false when any condition is false", async () => {
    await Promise.resolve();
    const condition = and(
      () => true,
      () => false,
      () => true
    );

    expect(condition({}, "read", {})).toBeFalsy();
  });

  it("should return false when all conditions are false", async () => {
    await Promise.resolve();
    const condition = and(
      () => false,
      () => false
    );

    expect(condition({}, "read", {})).toBeFalsy();
  });

  it("should return true with empty conditions", async () => {
    await Promise.resolve();
    const condition = and();

    expect(condition({}, "read", {})).toBeTruthy();
  });

  it("should short-circuit on first false", async () => {
    await Promise.resolve();
    let secondCalled = false;
    const condition = and(
      () => false,
      () => {
        secondCalled = true;
        return true;
      }
    );

    condition({}, "read", {});
    expect(secondCalled).toBeFalsy();
  });

  it("should pass context, action, and resource to all conditions", async () => {
    await Promise.resolve();
    interface AuthoredPost {
      authorId: string;
    }
    const condition = and<TestContext, string, AuthoredPost>(
      (ctx) => ctx.user.role === "admin",
      (_ctx, action) => action === "delete",
      (_ctx, _action, resource) => resource.authorId === "user-1"
    );

    expect(
      condition({ user: { id: "1", role: "admin" } }, "delete", {
        authorId: "user-1",
      })
    ).toBeTruthy();
    expect(
      condition({ user: { id: "1", role: "admin" } }, "delete", {
        authorId: "user-2",
      })
    ).toBeFalsy();
  });
});

describe(or, () => {
  it("should return true when any condition is true", async () => {
    await Promise.resolve();
    const condition = or(
      () => false,
      () => true,
      () => false
    );

    expect(condition({}, "read", {})).toBeTruthy();
  });

  it("should return false when all conditions are false", async () => {
    await Promise.resolve();
    const condition = or(
      () => false,
      () => false,
      () => false
    );

    expect(condition({}, "read", {})).toBeFalsy();
  });

  it("should return true when all conditions are true", async () => {
    await Promise.resolve();
    const condition = or(
      () => true,
      () => true
    );

    expect(condition({}, "read", {})).toBeTruthy();
  });

  it("should return false with empty conditions", async () => {
    await Promise.resolve();
    const condition = or();

    expect(condition({}, "read", {})).toBeFalsy();
  });

  it("should short-circuit on first true", async () => {
    await Promise.resolve();
    let secondCalled = false;
    const condition = or(
      () => true,
      () => {
        secondCalled = true;
        return false;
      }
    );

    condition({}, "read", {});
    expect(secondCalled).toBeFalsy();
  });

  it("should pass context, action, and resource to conditions", async () => {
    await Promise.resolve();
    interface VisiblePost {
      visibility: "public" | "private";
    }
    const condition = or<TestContext, string, VisiblePost>(
      (ctx) => ctx.user.role === "admin",
      (_ctx, _action, resource) => resource.visibility === "public"
    );

    expect(
      condition({ user: { id: "1", role: "guest" } }, "read", {
        visibility: "public",
      })
    ).toBeTruthy();
    expect(
      condition({ user: { id: "1", role: "admin" } }, "read", {
        visibility: "private",
      })
    ).toBeTruthy();
    expect(
      condition({ user: { id: "1", role: "guest" } }, "read", {
        visibility: "private",
      })
    ).toBeFalsy();
  });
});

describe(mergePoliciesAnd, () => {
  it("should deny when called with no policies", async () => {
    await Promise.resolve();
    const policy = mergePoliciesAnd<
      TestContext,
      typeof resources,
      typeof actions
    >();
    const ctx: TestContext = {
      user: { id: "1", role: "user" },
    };
    const post: Post = {
      authorId: "1",
      id: "1",
      status: "published",
      visibility: "public",
    };

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });
});

describe(mergePoliciesOr, () => {
  it("should deny when called with no policies", async () => {
    await Promise.resolve();
    const policy = mergePoliciesOr<
      TestContext,
      typeof resources,
      typeof actions
    >();
    const ctx: TestContext = {
      user: { id: "1", role: "user" },
    };
    const post: Post = {
      authorId: "1",
      id: "1",
      status: "published",
      visibility: "public",
    };

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });
});

describe(not, () => {
  it("should negate a true condition", async () => {
    await Promise.resolve();
    const condition = not(() => true);

    expect(condition({}, "read", {})).toBeFalsy();
  });

  it("should negate a false condition", async () => {
    await Promise.resolve();
    const condition = not(() => false);

    expect(condition({}, "read", {})).toBeTruthy();
  });

  it("should pass context, action, and resource to the condition", async () => {
    await Promise.resolve();
    interface AuthoredPost {
      authorId: string;
    }
    const isOwner = (
      ctx: TestContext,
      _action: string,
      resource: AuthoredPost
    ) => ctx.user.id === resource.authorId;
    const isNotOwner = not(isOwner);

    expect(
      isNotOwner({ user: { id: "user-1", role: "user" } }, "like", {
        authorId: "user-1",
      })
    ).toBeFalsy();
    expect(
      isNotOwner({ user: { id: "user-1", role: "user" } }, "like", {
        authorId: "user-2",
      })
    ).toBeTruthy();
  });

  it("should work with complex conditions", async () => {
    await Promise.resolve();
    const condition = not(
      and(
        () => true,
        () => true
      )
    );

    expect(condition({}, "read", {})).toBeFalsy();
  });
});

describe(has, () => {
  it("should return true when context property equals value", async () => {
    await Promise.resolve();
    const condition = has<TestContext["user"], "role">("role", "admin");

    expect(condition({ id: "1", role: "admin" }, "read", {})).toBeTruthy();
  });

  it("should return false when context property does not equal value", async () => {
    await Promise.resolve();
    const condition = has<TestContext["user"], "role">("role", "admin");

    expect(condition({ id: "1", role: "guest" }, "read", {})).toBeFalsy();
  });

  it("should work with string properties", async () => {
    await Promise.resolve();
    const condition = has<{ name: string }, "name">("name", "John");

    expect(condition({ name: "John" }, "read", {})).toBeTruthy();
    expect(condition({ name: "Jane" }, "read", {})).toBeFalsy();
  });

  it("should work with number properties", async () => {
    await Promise.resolve();
    const condition = has<{ level: number }, "level">("level", 5);

    expect(condition({ level: 5 }, "read", {})).toBeTruthy();
    expect(condition({ level: 3 }, "read", {})).toBeFalsy();
  });

  it("should work with boolean properties", async () => {
    await Promise.resolve();
    const condition = has<{ active: boolean }, "active">("active", true);

    expect(condition({ active: true }, "read", {})).toBeTruthy();
    expect(condition({ active: false }, "read", {})).toBeFalsy();
  });

  it("should use strict equality", async () => {
    await Promise.resolve();
    const condition = has<{ value: number | string }, "value">("value", "5");

    expect(condition({ value: "5" }, "read", {})).toBeTruthy();
    expect(condition({ value: 5 }, "read", {})).toBeFalsy();
  });
});

describe(collectInheritedRoles, () => {
  type Role = "guest" | "user" | "moderator" | "admin";

  const hierarchy: RoleHierarchy<Role> = {
    admin: ["moderator"],
    guest: [],
    moderator: ["user"],
    user: ["guest"],
  };

  it("should return the role itself", async () => {
    await Promise.resolve();
    const roles = collectInheritedRoles(["guest"], hierarchy);

    expect(roles.has("guest")).toBeTruthy();
    expect(roles.size).toBe(1);
  });

  it("should collect direct parent roles", async () => {
    await Promise.resolve();
    const roles = collectInheritedRoles(["user"], hierarchy);

    expect(roles.has("user")).toBeTruthy();
    expect(roles.has("guest")).toBeTruthy();
    expect(roles.size).toBe(2);
  });

  it("should collect all inherited roles recursively", async () => {
    await Promise.resolve();
    const roles = collectInheritedRoles(["admin"], hierarchy);

    expect(roles.has("admin")).toBeTruthy();
    expect(roles.has("moderator")).toBeTruthy();
    expect(roles.has("user")).toBeTruthy();
    expect(roles.has("guest")).toBeTruthy();
    expect(roles.size).toBe(4);
  });

  it("should handle multiple input roles", async () => {
    await Promise.resolve();
    const roles = collectInheritedRoles(["user", "moderator"], hierarchy);

    expect(roles.has("user")).toBeTruthy();
    expect(roles.has("moderator")).toBeTruthy();
    expect(roles.has("guest")).toBeTruthy();
    expect(roles.size).toBe(3);
  });

  it("should handle diamond inheritance", async () => {
    await Promise.resolve();
    type DiamondRole = "a" | "b" | "c" | "d";
    const diamondHierarchy: RoleHierarchy<DiamondRole> = {
      a: [],
      b: ["a"],
      c: ["a"],
      d: ["b", "c"],
    };

    const roles = collectInheritedRoles(["d"], diamondHierarchy);

    expect(roles.has("a")).toBeTruthy();
    expect(roles.has("b")).toBeTruthy();
    expect(roles.has("c")).toBeTruthy();
    expect(roles.has("d")).toBeTruthy();
    expect(roles.size).toBe(4);
  });

  it("should handle empty input array", async () => {
    await Promise.resolve();
    const roles = collectInheritedRoles([], hierarchy);

    expect(roles.size).toBe(0);
  });

  it("should handle roles not in hierarchy", async () => {
    await Promise.resolve();
    const roles = collectInheritedRoles(["unknown" as Role], hierarchy);

    expect(roles.has("unknown" as Role)).toBeTruthy();
    expect(roles.size).toBe(1);
  });
});

describe(hasRole, () => {
  type Role = "guest" | "user" | "admin";

  const hierarchy: RoleHierarchy<Role> = {
    admin: ["user"],
    guest: [],
    user: ["guest"],
  };

  describe("without hierarchy", () => {
    it("should return true when user has the exact role (single role)", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role;
      }
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: "admin" }, "read", {})).toBeTruthy();
    });

    it("should return false when user does not have the role (single role)", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role;
      }
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: "user" }, "read", {})).toBeFalsy();
    });

    it("should return true when user has the role in array", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role[];
      }
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: ["user", "admin"] }, "read", {})).toBeTruthy();
    });

    it("should return false when user does not have the role in array", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role[];
      }
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: ["guest", "user"] }, "read", {})).toBeFalsy();
    });

    it("should handle empty role array", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role[];
      }
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: [] }, "read", {})).toBeFalsy();
    });
  });

  describe("with hierarchy", () => {
    it("should return true when user has the exact role", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role;
      }
      const condition = hasRole<Ctx, string, unknown, Role>("user", hierarchy);

      expect(condition({ role: "user" }, "read", {})).toBeTruthy();
    });

    it("should return true when user inherits the role", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role;
      }
      const condition = hasRole<Ctx, string, unknown, Role>("guest", hierarchy);

      expect(condition({ role: "admin" }, "read", {})).toBeTruthy();
      expect(condition({ role: "user" }, "read", {})).toBeTruthy();
    });

    it("should return false when user does not have or inherit the role", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role;
      }
      const condition = hasRole<Ctx, string, unknown, Role>("admin", hierarchy);

      expect(condition({ role: "user" }, "read", {})).toBeFalsy();
      expect(condition({ role: "guest" }, "read", {})).toBeFalsy();
    });

    it("should work with role arrays and hierarchy", async () => {
      await Promise.resolve();
      interface Ctx {
        role: Role[];
      }
      const condition = hasRole<Ctx, string, unknown, Role>("guest", hierarchy);

      expect(condition({ role: ["user"] }, "read", {})).toBeTruthy();
      expect(condition({ role: ["admin"] }, "read", {})).toBeTruthy();
    });

    it("should handle diamond inheritance in hasRole", async () => {
      await Promise.resolve();
      type DiamondRole = "viewer" | "editor" | "commenter" | "owner";
      interface Ctx {
        role: DiamondRole;
      }

      const diamondHierarchy: RoleHierarchy<DiamondRole> = {
        commenter: ["viewer"],
        editor: ["viewer"],
        owner: ["editor", "commenter"],
        viewer: [],
      };

      const condition = hasRole<Ctx, string, unknown, DiamondRole>(
        "viewer",
        diamondHierarchy
      );

      expect(condition({ role: "owner" }, "read", {})).toBeTruthy();
      expect(condition({ role: "editor" }, "read", {})).toBeTruthy();
      expect(condition({ role: "commenter" }, "read", {})).toBeTruthy();
      expect(condition({ role: "viewer" }, "read", {})).toBeTruthy();
    });
  });
});

describe(createPolicy, () => {
  it("should create a policy with can method", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          delete: deny(),
          read: allow(),
          write: deny(),
        },
        post: {
          delete: deny(),
          publish: deny(),
          read: allow(),
          write: deny(),
        },
      },
    });

    expect(policy).toHaveProperty("can");
    expect(policy.can).toBeTypeOf("function");
  });

  it("should allow actions with allow() rule", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          delete: deny(),
          read: allow(),
          write: deny(),
        },
        post: {
          delete: deny(),
          publish: deny(),
          read: allow(),
          write: deny(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "guest" } };
    const post = {
      authorId: "user-2",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeTruthy();
  });

  it("should deny actions with deny() rule", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          delete: deny(),
          read: allow(),
          write: deny(),
        },
        post: {
          delete: deny(),
          publish: deny(),
          read: allow(),
          write: deny(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "admin" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(policy.can(ctx, "post:write", post)).resolves.toBeFalsy();
  });

  it("should deny malformed permission strings", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          read: allow(),
        },
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "guest" } };
    const post: Post = {
      authorId: "user-2",
      id: "1",
      status: "published",
      visibility: "public",
    };

    await expect(
      policy.can(ctx, "post" as "post:read", post)
    ).resolves.toBeFalsy();
    await expect(
      policy.can(ctx, "post:read:extra" as "post:read", post)
    ).resolves.toBeFalsy();
  });

  it("should deny unknown resource or action pairs", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          read: allow(),
        },
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "guest" } };
    const post: Post = {
      authorId: "user-2",
      id: "1",
      status: "published",
      visibility: "public",
    };

    await expect(
      policy.can(ctx, "article:read" as "post:read", post)
    ).resolves.toBeFalsy();
    await expect(
      policy.can(ctx, "post:archive" as "post:read", post)
    ).resolves.toBeFalsy();
  });

  it("should deny when the actions map has no entry for a resource type", async () => {
    await Promise.resolve();
    const brokenActions = {
      comment: undefined,
      post: ["read"],
    } as unknown as typeof actions;
    const policy = createPolicy<
      TestContext,
      typeof resources,
      typeof brokenActions
    >({
      actions: brokenActions,
      resources,
      rules: {
        comment: {
          read: allow(),
        },
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "guest" } };
    const comment: Comment = { authorId: "user-1", id: "1", postId: "1" };

    await expect(policy.can(ctx, "comment:read", comment)).resolves.toBeFalsy();
  });

  it("should evaluate when() conditions", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          delete: when((_ctx) => _ctx.user.role === "admin"),
          read: allow(),
          write: when(
            (_ctx, _action, resource) => _ctx.user.id === resource.authorId
          ),
        },
        post: {
          delete: when((_ctx) => _ctx.user.role === "admin"),
          publish: deny(),
          read: when(
            (_ctx, _action, resource) =>
              resource.visibility === "public" ||
              _ctx.user.id === resource.authorId
          ),
          write: when(
            (_ctx, _action, resource) => _ctx.user.id === resource.authorId
          ),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };
    const publicPost = {
      authorId: "user-2",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };
    const privatePost = {
      authorId: "user-2",
      id: "2",
      status: "published" as const,
      visibility: "private" as const,
    };
    const ownPost = {
      authorId: "user-1",
      id: "3",
      status: "draft" as const,
      visibility: "private" as const,
    };

    await expect(
      policy.can(ctx, "post:read", publicPost)
    ).resolves.toBeTruthy();
    await expect(
      policy.can(ctx, "post:read", privatePost)
    ).resolves.toBeFalsy();
    await expect(policy.can(ctx, "post:read", ownPost)).resolves.toBeTruthy();
    await expect(policy.can(ctx, "post:write", ownPost)).resolves.toBeTruthy();
    await expect(
      policy.can(ctx, "post:write", publicPost)
    ).resolves.toBeFalsy();
  });

  it("should deny when resource type has no rules", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {},
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "admin" } };
    const comment = { authorId: "user-1", id: "1", postId: "post-1" };

    await expect(policy.can(ctx, "comment:read", comment)).resolves.toBeFalsy();
  });

  it("should deny when action has no rule defined", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          read: allow(),
        },
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "admin" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(policy.can(ctx, "post:write", post)).resolves.toBeFalsy();
  });

  it("should work with complex conditions using and/or/not", async () => {
    await Promise.resolve();
    interface PostResource {
      authorId: string;
      visibility: string;
    }
    interface CommentResource {
      authorId: string;
    }

    const isPostOwner = (
      ctx: TestContext,
      _action: string,
      resource: PostResource
    ) => ctx.user.id === resource.authorId;
    const isCommentOwner = (
      ctx: TestContext,
      _action: string,
      resource: CommentResource
    ) => ctx.user.id === resource.authorId;
    const isAdmin = (ctx: TestContext) => ctx.user.role === "admin";
    const isPublic = (
      _ctx: TestContext,
      _action: string,
      resource: PostResource
    ) => resource.visibility === "public";

    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          delete: when(or(isCommentOwner, isAdmin)),
          read: allow(),
          write: when(isCommentOwner),
        },
        post: {
          delete: when(and(isPostOwner, not(isPublic))),
          publish: when(isAdmin),
          read: when(or(isPublic, isPostOwner, isAdmin)),
          write: when(or(isPostOwner, isAdmin)),
        },
      },
    });

    const admin: TestContext = { user: { id: "admin-1", role: "admin" } };
    const user: TestContext = { user: { id: "user-1", role: "user" } };
    const publicPost = {
      authorId: "user-2",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };
    const privatePost = {
      authorId: "user-1",
      id: "2",
      status: "draft" as const,
      visibility: "private" as const,
    };

    await expect(
      Promise.all([
        policy.can(admin, "post:read", publicPost),
        policy.can(admin, "post:read", privatePost),
        policy.can(user, "post:read", publicPost),
        policy.can(user, "post:read", privatePost),
        policy.can(user, "post:delete", privatePost),
        policy.can(user, "post:delete", {
          ...privatePost,
          visibility: "public" as const,
        }),
        policy.can(admin, "post:publish", publicPost),
        policy.can(user, "post:publish", publicPost),
      ])
    ).resolves.toStrictEqual([
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      false,
    ]);
  });

  it("should deny when actions for a resource are missing at runtime", async () => {
    await Promise.resolve();
    const badActions = {
      post: actions.post,
    } as unknown as Actions<typeof resources>;

    const policy = createPolicy<
      TestContext,
      typeof resources,
      typeof badActions
    >({
      actions: badActions,
      resources,
      rules: {
        comment: {
          read: allow(),
        },
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };
    const comment: Comment = {
      authorId: "user-1",
      id: "1",
      postId: "post-1",
    };

    await expect(policy.can(ctx, "comment:read", comment)).resolves.toBeFalsy();
  });

  it("should deny when resource validation reports issues", async () => {
    await Promise.resolve();
    const failingResources = {
      post: {
        "~standard": {
          validate: () => ({
            issues: [{ message: "invalid" }],
          }),
          vendor: "test",
          version: 1,
        },
      } as StandardSchemaV1,
    } satisfies Resources<"post">;

    const failingActions = {
      post: ["read"],
    } as const satisfies Actions<typeof failingResources>;

    const policy = createPolicy<
      TestContext,
      typeof failingResources,
      typeof failingActions
    >({
      actions: failingActions,
      resources: failingResources,
      rules: {
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };
    const post: Post = {
      authorId: "user-1",
      id: "1",
      status: "published",
      visibility: "public",
    };

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });

  it("should deny when resource validation throws (no logger, no console)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const throwingResources = {
      post: {
        "~standard": {
          validate: () => {
            throw new Error("validator exploded");
          },
          vendor: "test",
          version: 1,
        },
      } as StandardSchemaV1,
    } satisfies Resources<"post">;

    const throwingActions = {
      post: ["read"],
    } as const satisfies Actions<typeof throwingResources>;

    const policy = createPolicy<
      TestContext,
      typeof throwingResources,
      typeof throwingActions
    >({
      actions: throwingActions,
      resources: throwingResources,
      rules: {
        post: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };
    const post: Post = {
      authorId: "user-1",
      id: "1",
      status: "published",
      visibility: "public",
    };

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("should throw PolicyError when a resource schema is missing", async () => {
    await Promise.resolve();
    const brokenResources = {
      post: undefined as unknown as StandardSchemaV1,
    } satisfies Resources<"post">;

    const brokenActions = {
      post: ["read"],
    } as const satisfies Actions<typeof brokenResources>;

    expect(() =>
      createPolicy<TestContext, typeof brokenResources, typeof brokenActions>({
        actions: brokenActions,
        resources: brokenResources,
        rules: {
          post: {
            read: allow(),
          },
        },
      })
    ).toThrow(PolicyError);
  });

  it("should support async resource schema validation", async () => {
    await Promise.resolve();
    const asyncResources = {
      post: {
        "~standard": {
          validate: () => Promise.resolve({ value: {} }),
          vendor: "test",
          version: 1,
        },
      } as StandardSchemaV1,
    } satisfies Resources<"post">;

    const asyncActions = {
      post: ["read"],
    } as const satisfies Actions<typeof asyncResources>;

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };
    const post: Post = {
      authorId: "user-1",
      id: "1",
      status: "published",
      visibility: "public",
    };

    const policy = createPolicy<
      TestContext,
      typeof asyncResources,
      typeof asyncActions
    >({
      actions: asyncActions,
      resources: asyncResources,
      rules: {
        post: {
          read: allow(),
        },
      },
    });

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeTruthy();
  });

  it("should deny when an allowed action has no validator entry at runtime", async () => {
    const runtimeResources = {
      post: createSchema<Post>(),
    } as unknown as typeof resources;

    const runtimeActions = {
      ...actions,
      profile: ["read"],
    } as unknown as typeof actions;

    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions: runtimeActions,
      resources: runtimeResources,
      rules: {
        ...({
          comment: {
            delete: deny(),
            read: deny(),
            write: deny(),
          },
          post: {
            delete: deny(),
            publish: deny(),
            read: allow(),
            write: deny(),
          },
          profile: {
            read: allow(),
          },
        } as const),
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };

    await expect(
      policy.can(ctx, "profile:read" as never, { id: "1" } as never)
    ).resolves.toBeFalsy();
  });

  it("should deny when a policy function throws", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {},
        post: {
          read: () => {
            throw new Error("boom");
          },
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };
    const post: Post = {
      authorId: "user-1",
      id: "1",
      status: "published",
      visibility: "public",
    };

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });

  it("should work with role-based access using hasRole", async () => {
    await Promise.resolve();
    interface RoleContext {
      role: "guest" | "user" | "admin";
      user: { id: string };
    }

    const hierarchy: RoleHierarchy<"guest" | "user" | "admin"> = {
      admin: ["user"],
      guest: [],
      user: ["guest"],
    };

    const policy = createPolicy<RoleContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {
          delete: when(hasRole("admin")),
          read: when(hasRole("guest", hierarchy)),
          write: when(hasRole("user", hierarchy)),
        },
        post: {
          delete: when(hasRole("admin")),
          publish: when(hasRole("admin")),
          read: when(hasRole("guest", hierarchy)),
          write: when(hasRole("user", hierarchy)),
        },
      },
    });

    const guest: RoleContext = { role: "guest", user: { id: "1" } };
    const user: RoleContext = { role: "user", user: { id: "2" } };
    const admin: RoleContext = { role: "admin", user: { id: "3" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(
      Promise.all([
        policy.can(guest, "post:read", post),
        policy.can(guest, "post:write", post),
        policy.can(guest, "post:delete", post),
        policy.can(user, "post:read", post),
        policy.can(user, "post:write", post),
        policy.can(user, "post:delete", post),
        policy.can(admin, "post:read", post),
        policy.can(admin, "post:write", post),
        policy.can(admin, "post:delete", post),
      ])
    ).resolves.toStrictEqual([
      true,
      false,
      false,
      true,
      true,
      false,
      true,
      true,
      true,
    ]);
  });
});

describe(mergePoliciesAnd, () => {
  it("should return a policy with can method", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { read: allow() },
          post: { read: allow() },
        },
      }
    );

    const merged = mergePoliciesAnd(policy1);

    expect(merged).toHaveProperty("can");
    expect(merged.can).toBeTypeOf("function");
  });

  it("should allow when all policies allow (every)", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: allow(),
            write: allow(),
          },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: allow(),
            write: allow(),
          },
        },
      }
    );

    const merged = mergePoliciesAnd(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(merged.can(ctx, "post:read", post)).resolves.toBeTruthy();
  });

  it("should deny when any policy denies (every)", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: allow(),
            write: allow(),
          },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: deny(), read: deny(), write: deny() },
          post: {
            delete: deny(),
            publish: deny(),
            read: deny(),
            write: deny(),
          },
        },
      }
    );

    const merged = mergePoliciesAnd(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(merged.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });

  it("should work with single policy", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: { delete: deny(), read: allow(), write: deny() },
        post: { delete: deny(), publish: deny(), read: allow(), write: deny() },
      },
    });

    const merged = mergePoliciesAnd(policy);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(merged.can(ctx, "post:read", post)).resolves.toBeTruthy();
    await expect(merged.can(ctx, "post:write", post)).resolves.toBeFalsy();
  });

  it("should work with empty policies array", async () => {
    await Promise.resolve();
    const merged = mergePoliciesAnd<
      TestContext,
      typeof resources,
      typeof actions
    >();
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    // With no policies, should deny (no policy allows)
    await expect(merged.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });

  it("should invoke every policy even after a deny (no short-circuit)", async () => {
    await Promise.resolve();
    let policy2Called = false;

    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: deny(), read: deny(), write: deny() },
          post: {
            delete: deny(),
            publish: deny(),
            read: deny(),
            write: deny(),
          },
        },
      }
    );

    const policy2: ReturnType<
      typeof createPolicy<TestContext, typeof resources, typeof actions>
    > = {
      can: async () => {
        await Promise.resolve();
        policy2Called = true;
        return true;
      },
    };

    const merged = mergePoliciesAnd(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    const result = await merged.can(ctx, "post:read", post);
    expect(policy2Called).toBeTruthy();
    expect(result).toBeFalsy();
  });

  it("should treat a policy whose can() rejects as denied", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: allow(),
            write: allow(),
          },
        },
      }
    );

    const policy2: ReturnType<
      typeof createPolicy<TestContext, typeof resources, typeof actions>
    > = {
      can: async () => {
        await Promise.resolve();
        throw new Error("boom");
      },
    };

    const merged = mergePoliciesAnd(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(merged.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });

  it("should evaluate conditional rules across policies", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: when((ctx) => ctx.user.role !== "guest"),
            write: allow(),
          },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: when(
              (_ctx, _action, resource) => resource.visibility === "public"
            ),
            write: allow(),
          },
        },
      }
    );

    const merged = mergePoliciesAnd(policy1, policy2);
    const user: TestContext = { user: { id: "1", role: "user" } };
    const guest: TestContext = { user: { id: "2", role: "guest" } };
    const publicPost = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };
    const privatePost = {
      authorId: "user-1",
      id: "2",
      status: "draft" as const,
      visibility: "private" as const,
    };

    // User reading public post - both policies allow
    await expect(
      merged.can(user, "post:read", publicPost)
    ).resolves.toBeTruthy();
    // User reading private post - policy2 denies
    await expect(
      merged.can(user, "post:read", privatePost)
    ).resolves.toBeFalsy();
    // Guest reading public post - policy1 denies
    await expect(
      merged.can(guest, "post:read", publicPost)
    ).resolves.toBeFalsy();
  });
});

describe(mergePoliciesOr, () => {
  it("should return a policy with can method", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { read: allow() },
          post: { read: allow() },
        },
      }
    );

    const merged = mergePoliciesOr(policy1);

    expect(merged).toHaveProperty("can");
    expect(merged.can).toBeTypeOf("function");
  });

  it("should allow when any policy allows (some)", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: deny(), read: deny(), write: deny() },
          post: {
            delete: deny(),
            publish: deny(),
            read: deny(),
            write: deny(),
          },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: allow(),
            write: allow(),
          },
        },
      }
    );

    const merged = mergePoliciesOr(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(merged.can(ctx, "post:read", post)).resolves.toBeTruthy();
  });

  it("should deny when all policies deny (some)", async () => {
    await Promise.resolve();
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: deny(), read: deny(), write: deny() },
          post: {
            delete: deny(),
            publish: deny(),
            read: deny(),
            write: deny(),
          },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: deny(), read: deny(), write: deny() },
          post: {
            delete: deny(),
            publish: deny(),
            read: deny(),
            write: deny(),
          },
        },
      }
    );

    const merged = mergePoliciesOr(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(merged.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });

  it("should work with single policy", async () => {
    await Promise.resolve();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: { delete: deny(), read: allow(), write: deny() },
        post: { delete: deny(), publish: deny(), read: allow(), write: deny() },
      },
    });

    const merged = mergePoliciesOr(policy);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await expect(merged.can(ctx, "post:read", post)).resolves.toBeTruthy();
    await expect(merged.can(ctx, "post:write", post)).resolves.toBeFalsy();
  });

  it("should work with empty policies array", async () => {
    await Promise.resolve();
    const merged = mergePoliciesOr<
      TestContext,
      typeof resources,
      typeof actions
    >();
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    // With no policies, should deny (no policy allows)
    await expect(merged.can(ctx, "post:read", post)).resolves.toBeFalsy();
  });

  it("should evaluate all policies in parallel (no short-circuit)", async () => {
    await Promise.resolve();
    let policy2Called = false;

    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        actions,
        resources,
        rules: {
          comment: { delete: allow(), read: allow(), write: allow() },
          post: {
            delete: allow(),
            publish: allow(),
            read: allow(),
            write: allow(),
          },
        },
      }
    );

    const policy2: ReturnType<
      typeof createPolicy<TestContext, typeof resources, typeof actions>
    > = {
      can: async () => {
        await Promise.resolve();
        policy2Called = true;
        return false;
      },
    };

    const merged = mergePoliciesOr(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      authorId: "user-1",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };

    await merged.can(ctx, "post:read", post);
    expect(policy2Called).toBeTruthy();
  });

  it("should support layered permissions pattern", async () => {
    await Promise.resolve();
    // Base policy: public access
    const publicPolicy = createPolicy<
      TestContext,
      typeof resources,
      typeof actions
    >({
      actions,
      resources,
      rules: {
        comment: { delete: deny(), read: allow(), write: deny() },
        post: {
          delete: deny(),
          publish: deny(),
          read: when(
            (_ctx, _action, resource) => resource.visibility === "public"
          ),
          write: deny(),
        },
      },
    });

    // Owner policy: owner access
    const ownerPolicy = createPolicy<
      TestContext,
      typeof resources,
      typeof actions
    >({
      actions,
      resources,
      rules: {
        comment: {
          delete: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
          read: allow(),
          write: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
        },
        post: {
          delete: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
          publish: deny(),
          read: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
          write: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
        },
      },
    });

    const merged = mergePoliciesOr(publicPolicy, ownerPolicy);
    const user: TestContext = { user: { id: "user-1", role: "user" } };
    const publicPost = {
      authorId: "user-2",
      id: "1",
      status: "published" as const,
      visibility: "public" as const,
    };
    const privateOwnPost = {
      authorId: "user-1",
      id: "2",
      status: "draft" as const,
      visibility: "private" as const,
    };
    const privateOtherPost = {
      authorId: "user-2",
      id: "3",
      status: "draft" as const,
      visibility: "private" as const,
    };

    // Can read public post (public policy allows)
    await expect(
      merged.can(user, "post:read", publicPost)
    ).resolves.toBeTruthy();
    // Can read own private post (owner policy allows)
    await expect(
      merged.can(user, "post:read", privateOwnPost)
    ).resolves.toBeTruthy();
    // Cannot read other's private post (neither policy allows)
    await expect(
      merged.can(user, "post:read", privateOtherPost)
    ).resolves.toBeFalsy();
    // Can write own post (owner policy allows)
    await expect(
      merged.can(user, "post:write", privateOwnPost)
    ).resolves.toBeTruthy();
    // Cannot write other's post (neither policy allows)
    await expect(
      merged.can(user, "post:write", publicPost)
    ).resolves.toBeFalsy();
  });
});

describe("logging", () => {
  const ctx: TestContext = { user: { id: "user-1", role: "user" } };
  const post: Post = {
    authorId: "user-1",
    id: "1",
    status: "published",
    visibility: "public",
  };

  it("logs an allow decision at debug", async () => {
    const logger = createRecordingLogger();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      logger,
      resources,
      rules: { comment: {}, post: { read: allow() } },
    });

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeTruthy();

    expect(logger.calls).toStrictEqual([
      {
        context: { action: "read", resourceType: "post" },
        level: "debug",
        message: "permission allowed",
      },
    ]);
  });

  it("routes the resource validation warning through the logger instead of console.warn", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logger = createRecordingLogger();
    const throwingResources = {
      post: {
        "~standard": {
          validate: () => {
            throw new Error("validator exploded");
          },
          vendor: "test",
          version: 1,
        },
      } as StandardSchemaV1,
    } satisfies Resources<"post">;
    const throwingActions = {
      post: ["read"],
    } as const satisfies Actions<typeof throwingResources>;

    const policy = createPolicy<
      TestContext,
      typeof throwingResources,
      typeof throwingActions
    >({
      actions: throwingActions,
      logger,
      resources: throwingResources,
      rules: { post: { read: allow() } },
    });

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();

    expect(warnSpy).not.toHaveBeenCalled();
    expect(logger.calls).toStrictEqual([
      {
        context: {
          error: expect.any(Error),
          resourceType: "post",
        },
        level: "warn",
        message:
          "Resource validation failed for post: Error: validator exploded",
      },
    ]);
  });

  it("logs a deny decision at info", async () => {
    const logger = createRecordingLogger();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      logger,
      resources,
      rules: { comment: {}, post: { read: deny() } },
    });

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();

    expect(logger.calls).toStrictEqual([
      {
        context: { action: "read", resourceType: "post" },
        level: "info",
        message: "permission denied",
      },
    ]);
  });

  it("routes the policy evaluation error warning through the logger instead of console.warn", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logger = createRecordingLogger();
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      logger,
      resources,
      rules: {
        comment: {},
        post: {
          read: () => {
            throw new Error("boom");
          },
        },
      },
    });

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();

    expect(warnSpy).not.toHaveBeenCalled();
    const warnCall = logger.calls.find(
      (call) =>
        call.message === "Policy evaluation error for post.read: Error: boom"
    );
    expect(warnCall).toBeDefined();
    expect(warnCall?.level).toBe("warn");
  });

  it("does not call console.warn when no logger is provided", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        comment: {},
        post: {
          read: () => {
            throw new Error("boom");
          },
        },
      },
    });

    await expect(policy.can(ctx, "post:read", post)).resolves.toBeFalsy();

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
