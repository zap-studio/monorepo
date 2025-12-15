import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import {
  allow,
  and,
  collectInheritedRoles,
  createPolicy,
  deny,
  has,
  hasRole,
  mergePolicies,
  mergePoliciesAny,
  not,
  or,
  when,
} from "../src";
import type { Actions, Resources, RoleHierarchy } from "../src/types";

// Helper to create a mock Standard Schema
function createSchema<T>(): StandardSchemaV1<T, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: (value: unknown) => ({ value: value as T }),
    },
  };
}

// Test resource types
type Post = {
  id: string;
  authorId: string;
  visibility: "public" | "private";
  status: "draft" | "published";
};

type Comment = {
  id: string;
  postId: string;
  authorId: string;
};

// Test resources using mock Standard Schema
const resources = {
  post: createSchema<Post>(),
  comment: createSchema<Comment>(),
} satisfies Resources;

// Test actions
const actions = {
  post: ["read", "write", "delete", "publish"],
  comment: ["read", "write", "delete"],
} as const satisfies Actions<typeof resources>;

// Test context type
type TestContext = {
  user: {
    id: string;
    role: "guest" | "user" | "admin";
  };
};

describe("allow", () => {
  it("should return a function that always returns 'allow'", () => {
    const policyFn = allow();

    expect(policyFn({}, "read", {})).toBe("allow");
  });

  it("should ignore context, action, and resource", () => {
    const policyFn = allow<TestContext, string, unknown>();

    expect(
      policyFn({ user: { id: "1", role: "guest" } }, "write", { id: "1" })
    ).toBe("allow");
    expect(
      policyFn({ user: { id: "2", role: "admin" } }, "delete", { id: "2" })
    ).toBe("allow");
  });

  it("should work with any context type", () => {
    const policyFn = allow<{ custom: number }>();

    expect(policyFn({ custom: 42 }, "action", null)).toBe("allow");
  });
});

describe("deny", () => {
  it("should return a function that always returns 'deny'", () => {
    const policyFn = deny();

    expect(policyFn({}, "read", {})).toBe("deny");
  });

  it("should ignore context, action, and resource", () => {
    const policyFn = deny<TestContext, string, unknown>();

    expect(
      policyFn({ user: { id: "1", role: "admin" } }, "read", { id: "1" })
    ).toBe("deny");
    expect(
      policyFn({ user: { id: "2", role: "guest" } }, "write", { id: "2" })
    ).toBe("deny");
  });

  it("should work with any context type", () => {
    const policyFn = deny<{ custom: string }>();

    expect(policyFn({ custom: "test" }, "action", null)).toBe("deny");
  });
});

describe("when", () => {
  it("should return 'allow' when condition returns true", () => {
    const policyFn = when(() => true);

    expect(policyFn({}, "read", {})).toBe("allow");
  });

  it("should return 'deny' when condition returns false", () => {
    const policyFn = when(() => false);

    expect(policyFn({}, "read", {})).toBe("deny");
  });

  it("should pass context to the condition", () => {
    const policyFn = when<TestContext>((ctx) => ctx.user.role === "admin");

    expect(policyFn({ user: { id: "1", role: "admin" } }, "read", {})).toBe(
      "allow"
    );
    expect(policyFn({ user: { id: "1", role: "guest" } }, "read", {})).toBe(
      "deny"
    );
  });

  it("should pass action to the condition", () => {
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

  it("should pass resource to the condition", () => {
    type AuthoredPost = { authorId: string };
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

describe("and", () => {
  it("should return true when all conditions are true", () => {
    const condition = and(
      () => true,
      () => true,
      () => true
    );

    expect(condition({}, "read", {})).toBe(true);
  });

  it("should return false when any condition is false", () => {
    const condition = and(
      () => true,
      () => false,
      () => true
    );

    expect(condition({}, "read", {})).toBe(false);
  });

  it("should return false when all conditions are false", () => {
    const condition = and(
      () => false,
      () => false
    );

    expect(condition({}, "read", {})).toBe(false);
  });

  it("should return true with empty conditions", () => {
    const condition = and();

    expect(condition({}, "read", {})).toBe(true);
  });

  it("should short-circuit on first false", () => {
    let secondCalled = false;
    const condition = and(
      () => false,
      () => {
        secondCalled = true;
        return true;
      }
    );

    condition({}, "read", {});
    expect(secondCalled).toBe(false);
  });

  it("should pass context, action, and resource to all conditions", () => {
    type AuthoredPost = { authorId: string };
    const condition = and<TestContext, string, AuthoredPost>(
      (ctx) => ctx.user.role === "admin",
      (_ctx, action) => action === "delete",
      (_ctx, _action, resource) => resource.authorId === "user-1"
    );

    expect(
      condition({ user: { id: "1", role: "admin" } }, "delete", {
        authorId: "user-1",
      })
    ).toBe(true);
    expect(
      condition({ user: { id: "1", role: "admin" } }, "delete", {
        authorId: "user-2",
      })
    ).toBe(false);
  });
});

describe("or", () => {
  it("should return true when any condition is true", () => {
    const condition = or(
      () => false,
      () => true,
      () => false
    );

    expect(condition({}, "read", {})).toBe(true);
  });

  it("should return false when all conditions are false", () => {
    const condition = or(
      () => false,
      () => false,
      () => false
    );

    expect(condition({}, "read", {})).toBe(false);
  });

  it("should return true when all conditions are true", () => {
    const condition = or(
      () => true,
      () => true
    );

    expect(condition({}, "read", {})).toBe(true);
  });

  it("should return false with empty conditions", () => {
    const condition = or();

    expect(condition({}, "read", {})).toBe(false);
  });

  it("should short-circuit on first true", () => {
    let secondCalled = false;
    const condition = or(
      () => true,
      () => {
        secondCalled = true;
        return false;
      }
    );

    condition({}, "read", {});
    expect(secondCalled).toBe(false);
  });

  it("should pass context, action, and resource to conditions", () => {
    type VisiblePost = { visibility: "public" | "private" };
    const condition = or<TestContext, string, VisiblePost>(
      (ctx) => ctx.user.role === "admin",
      (_ctx, _action, resource) => resource.visibility === "public"
    );

    expect(
      condition({ user: { id: "1", role: "guest" } }, "read", {
        visibility: "public",
      })
    ).toBe(true);
    expect(
      condition({ user: { id: "1", role: "admin" } }, "read", {
        visibility: "private",
      })
    ).toBe(true);
    expect(
      condition({ user: { id: "1", role: "guest" } }, "read", {
        visibility: "private",
      })
    ).toBe(false);
  });
});

describe("not", () => {
  it("should negate a true condition", () => {
    const condition = not(() => true);

    expect(condition({}, "read", {})).toBe(false);
  });

  it("should negate a false condition", () => {
    const condition = not(() => false);

    expect(condition({}, "read", {})).toBe(true);
  });

  it("should pass context, action, and resource to the condition", () => {
    type AuthoredPost = { authorId: string };
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
    ).toBe(false);
    expect(
      isNotOwner({ user: { id: "user-1", role: "user" } }, "like", {
        authorId: "user-2",
      })
    ).toBe(true);
  });

  it("should work with complex conditions", () => {
    const condition = not(
      and(
        () => true,
        () => true
      )
    );

    expect(condition({}, "read", {})).toBe(false);
  });
});

describe("has", () => {
  it("should return true when context property equals value", () => {
    const condition = has<TestContext["user"], "role">("role", "admin");

    expect(condition({ id: "1", role: "admin" }, "read", {})).toBe(true);
  });

  it("should return false when context property does not equal value", () => {
    const condition = has<TestContext["user"], "role">("role", "admin");

    expect(condition({ id: "1", role: "guest" }, "read", {})).toBe(false);
  });

  it("should work with string properties", () => {
    const condition = has<{ name: string }, "name">("name", "John");

    expect(condition({ name: "John" }, "read", {})).toBe(true);
    expect(condition({ name: "Jane" }, "read", {})).toBe(false);
  });

  it("should work with number properties", () => {
    const condition = has<{ level: number }, "level">("level", 5);

    expect(condition({ level: 5 }, "read", {})).toBe(true);
    expect(condition({ level: 3 }, "read", {})).toBe(false);
  });

  it("should work with boolean properties", () => {
    const condition = has<{ active: boolean }, "active">("active", true);

    expect(condition({ active: true }, "read", {})).toBe(true);
    expect(condition({ active: false }, "read", {})).toBe(false);
  });

  it("should use strict equality", () => {
    const condition = has<{ value: number | string }, "value">("value", "5");

    expect(condition({ value: "5" }, "read", {})).toBe(true);
    expect(condition({ value: 5 }, "read", {})).toBe(false);
  });
});

describe("collectInheritedRoles", () => {
  type Role = "guest" | "user" | "moderator" | "admin";

  const hierarchy: RoleHierarchy<Role> = {
    guest: [],
    user: ["guest"],
    moderator: ["user"],
    admin: ["moderator"],
  };

  it("should return the role itself", () => {
    const roles = collectInheritedRoles(["guest"], hierarchy);

    expect(roles.has("guest")).toBe(true);
    expect(roles.size).toBe(1);
  });

  it("should collect direct parent roles", () => {
    const roles = collectInheritedRoles(["user"], hierarchy);

    expect(roles.has("user")).toBe(true);
    expect(roles.has("guest")).toBe(true);
    expect(roles.size).toBe(2);
  });

  it("should collect all inherited roles recursively", () => {
    const roles = collectInheritedRoles(["admin"], hierarchy);

    expect(roles.has("admin")).toBe(true);
    expect(roles.has("moderator")).toBe(true);
    expect(roles.has("user")).toBe(true);
    expect(roles.has("guest")).toBe(true);
    expect(roles.size).toBe(4);
  });

  it("should handle multiple input roles", () => {
    const roles = collectInheritedRoles(["user", "moderator"], hierarchy);

    expect(roles.has("user")).toBe(true);
    expect(roles.has("moderator")).toBe(true);
    expect(roles.has("guest")).toBe(true);
    expect(roles.size).toBe(3);
  });

  it("should handle diamond inheritance", () => {
    type DiamondRole = "a" | "b" | "c" | "d";
    const diamondHierarchy: RoleHierarchy<DiamondRole> = {
      a: [],
      b: ["a"],
      c: ["a"],
      d: ["b", "c"],
    };

    const roles = collectInheritedRoles(["d"], diamondHierarchy);

    expect(roles.has("a")).toBe(true);
    expect(roles.has("b")).toBe(true);
    expect(roles.has("c")).toBe(true);
    expect(roles.has("d")).toBe(true);
    expect(roles.size).toBe(4);
  });

  it("should handle empty input array", () => {
    const roles = collectInheritedRoles([], hierarchy);

    expect(roles.size).toBe(0);
  });

  it("should handle roles not in hierarchy", () => {
    const roles = collectInheritedRoles(["unknown" as Role], hierarchy);

    expect(roles.has("unknown" as Role)).toBe(true);
    expect(roles.size).toBe(1);
  });
});

describe("hasRole", () => {
  type Role = "guest" | "user" | "admin";

  const hierarchy: RoleHierarchy<Role> = {
    guest: [],
    user: ["guest"],
    admin: ["user"],
  };

  describe("without hierarchy", () => {
    it("should return true when user has the exact role (single role)", () => {
      type Ctx = { role: Role };
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: "admin" }, "read", {})).toBe(true);
    });

    it("should return false when user does not have the role (single role)", () => {
      type Ctx = { role: Role };
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: "user" }, "read", {})).toBe(false);
    });

    it("should return true when user has the role in array", () => {
      type Ctx = { role: Role[] };
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: ["user", "admin"] }, "read", {})).toBe(true);
    });

    it("should return false when user does not have the role in array", () => {
      type Ctx = { role: Role[] };
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: ["guest", "user"] }, "read", {})).toBe(false);
    });

    it("should handle empty role array", () => {
      type Ctx = { role: Role[] };
      const condition = hasRole<Ctx>("admin");

      expect(condition({ role: [] }, "read", {})).toBe(false);
    });
  });

  describe("with hierarchy", () => {
    it("should return true when user has the exact role", () => {
      type Ctx = { role: Role };
      const condition = hasRole<Ctx, string, unknown, Role>("user", hierarchy);

      expect(condition({ role: "user" }, "read", {})).toBe(true);
    });

    it("should return true when user inherits the role", () => {
      type Ctx = { role: Role };
      const condition = hasRole<Ctx, string, unknown, Role>("guest", hierarchy);

      expect(condition({ role: "admin" }, "read", {})).toBe(true);
      expect(condition({ role: "user" }, "read", {})).toBe(true);
    });

    it("should return false when user does not have or inherit the role", () => {
      type Ctx = { role: Role };
      const condition = hasRole<Ctx, string, unknown, Role>("admin", hierarchy);

      expect(condition({ role: "user" }, "read", {})).toBe(false);
      expect(condition({ role: "guest" }, "read", {})).toBe(false);
    });

    it("should work with role arrays and hierarchy", () => {
      type Ctx = { role: Role[] };
      const condition = hasRole<Ctx, string, unknown, Role>("guest", hierarchy);

      expect(condition({ role: ["user"] }, "read", {})).toBe(true);
      expect(condition({ role: ["admin"] }, "read", {})).toBe(true);
    });

    it("should handle diamond inheritance in hasRole", () => {
      type DiamondRole = "viewer" | "editor" | "commenter" | "owner";
      type Ctx = { role: DiamondRole };

      const diamondHierarchy: RoleHierarchy<DiamondRole> = {
        viewer: [],
        editor: ["viewer"],
        commenter: ["viewer"],
        owner: ["editor", "commenter"],
      };

      const condition = hasRole<Ctx, string, unknown, DiamondRole>(
        "viewer",
        diamondHierarchy
      );

      expect(condition({ role: "owner" }, "read", {})).toBe(true);
      expect(condition({ role: "editor" }, "read", {})).toBe(true);
      expect(condition({ role: "commenter" }, "read", {})).toBe(true);
      expect(condition({ role: "viewer" }, "read", {})).toBe(true);
    });
  });
});

describe("createPolicy", () => {
  it("should create a policy with can method", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: {
          read: allow(),
          write: deny(),
          delete: deny(),
          publish: deny(),
        },
        comment: {
          read: allow(),
          write: deny(),
          delete: deny(),
        },
      },
    });

    expect(policy).toHaveProperty("can");
    expect(typeof policy.can).toBe("function");
  });

  it("should allow actions with allow() rule", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: {
          read: allow(),
          write: deny(),
          delete: deny(),
          publish: deny(),
        },
        comment: {
          read: allow(),
          write: deny(),
          delete: deny(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "guest" } };
    const post = {
      id: "1",
      authorId: "user-2",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(policy.can(ctx, "read", "post", post)).toBe(true);
  });

  it("should deny actions with deny() rule", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: {
          read: allow(),
          write: deny(),
          delete: deny(),
          publish: deny(),
        },
        comment: {
          read: allow(),
          write: deny(),
          delete: deny(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "admin" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(policy.can(ctx, "write", "post", post)).toBe(false);
  });

  it("should evaluate when() conditions", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: {
          read: when(
            (_ctx, _action, resource) =>
              resource.visibility === "public" ||
              _ctx.user.id === resource.authorId
          ),
          write: when(
            (_ctx, _action, resource) => _ctx.user.id === resource.authorId
          ),
          delete: when((_ctx) => _ctx.user.role === "admin"),
          publish: deny(),
        },
        comment: {
          read: allow(),
          write: when(
            (_ctx, _action, resource) => _ctx.user.id === resource.authorId
          ),
          delete: when((_ctx) => _ctx.user.role === "admin"),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "user" } };
    const publicPost = {
      id: "1",
      authorId: "user-2",
      visibility: "public" as const,
      status: "published" as const,
    };
    const privatePost = {
      id: "2",
      authorId: "user-2",
      visibility: "private" as const,
      status: "published" as const,
    };
    const ownPost = {
      id: "3",
      authorId: "user-1",
      visibility: "private" as const,
      status: "draft" as const,
    };

    expect(policy.can(ctx, "read", "post", publicPost)).toBe(true);
    expect(policy.can(ctx, "read", "post", privatePost)).toBe(false);
    expect(policy.can(ctx, "read", "post", ownPost)).toBe(true);
    expect(policy.can(ctx, "write", "post", ownPost)).toBe(true);
    expect(policy.can(ctx, "write", "post", publicPost)).toBe(false);
  });

  it("should deny when resource type has no rules", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: {
          read: allow(),
        },
        comment: {},
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "admin" } };
    const comment = { id: "1", postId: "post-1", authorId: "user-1" };

    expect(policy.can(ctx, "read", "comment", comment)).toBe(false);
  });

  it("should deny when action has no rule defined", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: {
          read: allow(),
        },
        comment: {
          read: allow(),
        },
      },
    });

    const ctx: TestContext = { user: { id: "user-1", role: "admin" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(policy.can(ctx, "write", "post", post)).toBe(false);
  });

  it("should work with complex conditions using and/or/not", () => {
    type PostResource = { authorId: string; visibility: string };
    type CommentResource = { authorId: string };

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
      resources,
      actions,
      rules: {
        post: {
          read: when(or(isPublic, isPostOwner, isAdmin)),
          write: when(or(isPostOwner, isAdmin)),
          delete: when(and(isPostOwner, not(isPublic))),
          publish: when(isAdmin),
        },
        comment: {
          read: allow(),
          write: when(isCommentOwner),
          delete: when(or(isCommentOwner, isAdmin)),
        },
      },
    });

    const admin: TestContext = { user: { id: "admin-1", role: "admin" } };
    const user: TestContext = { user: { id: "user-1", role: "user" } };
    const publicPost = {
      id: "1",
      authorId: "user-2",
      visibility: "public" as const,
      status: "published" as const,
    };
    const privatePost = {
      id: "2",
      authorId: "user-1",
      visibility: "private" as const,
      status: "draft" as const,
    };

    // Admin can read anything
    expect(policy.can(admin, "read", "post", publicPost)).toBe(true);
    expect(policy.can(admin, "read", "post", privatePost)).toBe(true);

    // User can read public or own posts
    expect(policy.can(user, "read", "post", publicPost)).toBe(true);
    expect(policy.can(user, "read", "post", privatePost)).toBe(true);

    // Owner can delete private posts only
    expect(policy.can(user, "delete", "post", privatePost)).toBe(true);
    expect(
      policy.can(user, "delete", "post", {
        ...privatePost,
        visibility: "public" as const,
      })
    ).toBe(false);

    // Only admin can publish
    expect(policy.can(admin, "publish", "post", publicPost)).toBe(true);
    expect(policy.can(user, "publish", "post", publicPost)).toBe(false);
  });

  it("should work with role-based access using hasRole", () => {
    type RoleContext = {
      user: { id: string };
      role: "guest" | "user" | "admin";
    };

    const hierarchy: RoleHierarchy<"guest" | "user" | "admin"> = {
      guest: [],
      user: ["guest"],
      admin: ["user"],
    };

    const policy = createPolicy<RoleContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: {
          read: when(hasRole("guest", hierarchy)),
          write: when(hasRole("user", hierarchy)),
          delete: when(hasRole("admin")),
          publish: when(hasRole("admin")),
        },
        comment: {
          read: when(hasRole("guest", hierarchy)),
          write: when(hasRole("user", hierarchy)),
          delete: when(hasRole("admin")),
        },
      },
    });

    const guest: RoleContext = { user: { id: "1" }, role: "guest" };
    const user: RoleContext = { user: { id: "2" }, role: "user" };
    const admin: RoleContext = { user: { id: "3" }, role: "admin" };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    // Guest can only read
    expect(policy.can(guest, "read", "post", post)).toBe(true);
    expect(policy.can(guest, "write", "post", post)).toBe(false);
    expect(policy.can(guest, "delete", "post", post)).toBe(false);

    // User inherits guest and can write
    expect(policy.can(user, "read", "post", post)).toBe(true);
    expect(policy.can(user, "write", "post", post)).toBe(true);
    expect(policy.can(user, "delete", "post", post)).toBe(false);

    // Admin can do everything
    expect(policy.can(admin, "read", "post", post)).toBe(true);
    expect(policy.can(admin, "write", "post", post)).toBe(true);
    expect(policy.can(admin, "delete", "post", post)).toBe(true);
  });
});

describe("mergePolicies", () => {
  it("should return a policy with can method", () => {
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: { read: allow() },
          comment: { read: allow() },
        },
      }
    );

    const merged = mergePolicies(policy1);

    expect(merged).toHaveProperty("can");
    expect(typeof merged.can).toBe("function");
  });

  it("should allow when all policies allow (deny-overrides)", () => {
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: allow(),
            write: allow(),
            delete: allow(),
            publish: allow(),
          },
          comment: { read: allow(), write: allow(), delete: allow() },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: allow(),
            write: allow(),
            delete: allow(),
            publish: allow(),
          },
          comment: { read: allow(), write: allow(), delete: allow() },
        },
      }
    );

    const merged = mergePolicies(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(merged.can(ctx, "read", "post", post)).toBe(true);
  });

  it("should deny when any policy denies (deny-overrides)", () => {
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: allow(),
            write: allow(),
            delete: allow(),
            publish: allow(),
          },
          comment: { read: allow(), write: allow(), delete: allow() },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: deny(),
            write: deny(),
            delete: deny(),
            publish: deny(),
          },
          comment: { read: deny(), write: deny(), delete: deny() },
        },
      }
    );

    const merged = mergePolicies(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(merged.can(ctx, "read", "post", post)).toBe(false);
  });

  it("should work with single policy", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: { read: allow(), write: deny(), delete: deny(), publish: deny() },
        comment: { read: allow(), write: deny(), delete: deny() },
      },
    });

    const merged = mergePolicies(policy);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(merged.can(ctx, "read", "post", post)).toBe(true);
    expect(merged.can(ctx, "write", "post", post)).toBe(false);
  });

  it("should work with empty policies array", () => {
    const merged = mergePolicies<
      TestContext,
      typeof resources,
      typeof actions
    >();
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    // With no policies, should allow (vacuously true)
    expect(merged.can(ctx, "read", "post", post)).toBe(true);
  });

  it("should short-circuit on first deny", () => {
    let policy2Called = false;

    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: deny(),
            write: deny(),
            delete: deny(),
            publish: deny(),
          },
          comment: { read: deny(), write: deny(), delete: deny() },
        },
      }
    );

    const policy2: ReturnType<
      typeof createPolicy<TestContext, typeof resources, typeof actions>
    > = {
      can: () => {
        policy2Called = true;
        return true;
      },
    };

    const merged = mergePolicies(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    merged.can(ctx, "read", "post", post);
    expect(policy2Called).toBe(false);
  });

  it("should evaluate conditional rules across policies", () => {
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: when((ctx) => ctx.user.role !== "guest"),
            write: allow(),
            delete: allow(),
            publish: allow(),
          },
          comment: { read: allow(), write: allow(), delete: allow() },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: when(
              (_ctx, _action, resource) => resource.visibility === "public"
            ),
            write: allow(),
            delete: allow(),
            publish: allow(),
          },
          comment: { read: allow(), write: allow(), delete: allow() },
        },
      }
    );

    const merged = mergePolicies(policy1, policy2);
    const user: TestContext = { user: { id: "1", role: "user" } };
    const guest: TestContext = { user: { id: "2", role: "guest" } };
    const publicPost = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };
    const privatePost = {
      id: "2",
      authorId: "user-1",
      visibility: "private" as const,
      status: "draft" as const,
    };

    // User reading public post - both policies allow
    expect(merged.can(user, "read", "post", publicPost)).toBe(true);
    // User reading private post - policy2 denies
    expect(merged.can(user, "read", "post", privatePost)).toBe(false);
    // Guest reading public post - policy1 denies
    expect(merged.can(guest, "read", "post", publicPost)).toBe(false);
  });
});

describe("mergePoliciesAny", () => {
  it("should return a policy with can method", () => {
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: { read: allow() },
          comment: { read: allow() },
        },
      }
    );

    const merged = mergePoliciesAny(policy1);

    expect(merged).toHaveProperty("can");
    expect(typeof merged.can).toBe("function");
  });

  it("should allow when any policy allows (allow-overrides)", () => {
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: deny(),
            write: deny(),
            delete: deny(),
            publish: deny(),
          },
          comment: { read: deny(), write: deny(), delete: deny() },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: allow(),
            write: allow(),
            delete: allow(),
            publish: allow(),
          },
          comment: { read: allow(), write: allow(), delete: allow() },
        },
      }
    );

    const merged = mergePoliciesAny(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(merged.can(ctx, "read", "post", post)).toBe(true);
  });

  it("should deny when all policies deny (allow-overrides)", () => {
    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: deny(),
            write: deny(),
            delete: deny(),
            publish: deny(),
          },
          comment: { read: deny(), write: deny(), delete: deny() },
        },
      }
    );

    const policy2 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: deny(),
            write: deny(),
            delete: deny(),
            publish: deny(),
          },
          comment: { read: deny(), write: deny(), delete: deny() },
        },
      }
    );

    const merged = mergePoliciesAny(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(merged.can(ctx, "read", "post", post)).toBe(false);
  });

  it("should work with single policy", () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      resources,
      actions,
      rules: {
        post: { read: allow(), write: deny(), delete: deny(), publish: deny() },
        comment: { read: allow(), write: deny(), delete: deny() },
      },
    });

    const merged = mergePoliciesAny(policy);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    expect(merged.can(ctx, "read", "post", post)).toBe(true);
    expect(merged.can(ctx, "write", "post", post)).toBe(false);
  });

  it("should work with empty policies array", () => {
    const merged = mergePoliciesAny<
      TestContext,
      typeof resources,
      typeof actions
    >();
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    // With no policies, should deny (no policy allows)
    expect(merged.can(ctx, "read", "post", post)).toBe(false);
  });

  it("should short-circuit on first allow", () => {
    let policy2Called = false;

    const policy1 = createPolicy<TestContext, typeof resources, typeof actions>(
      {
        resources,
        actions,
        rules: {
          post: {
            read: allow(),
            write: allow(),
            delete: allow(),
            publish: allow(),
          },
          comment: { read: allow(), write: allow(), delete: allow() },
        },
      }
    );

    const policy2: ReturnType<
      typeof createPolicy<TestContext, typeof resources, typeof actions>
    > = {
      can: () => {
        policy2Called = true;
        return false;
      },
    };

    const merged = mergePoliciesAny(policy1, policy2);
    const ctx: TestContext = { user: { id: "1", role: "user" } };
    const post = {
      id: "1",
      authorId: "user-1",
      visibility: "public" as const,
      status: "published" as const,
    };

    merged.can(ctx, "read", "post", post);
    expect(policy2Called).toBe(false);
  });

  it("should support layered permissions pattern", () => {
    // Base policy: public access
    const publicPolicy = createPolicy<
      TestContext,
      typeof resources,
      typeof actions
    >({
      resources,
      actions,
      rules: {
        post: {
          read: when(
            (_ctx, _action, resource) => resource.visibility === "public"
          ),
          write: deny(),
          delete: deny(),
          publish: deny(),
        },
        comment: { read: allow(), write: deny(), delete: deny() },
      },
    });

    // Owner policy: owner access
    const ownerPolicy = createPolicy<
      TestContext,
      typeof resources,
      typeof actions
    >({
      resources,
      actions,
      rules: {
        post: {
          read: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
          write: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
          delete: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
          publish: deny(),
        },
        comment: {
          read: allow(),
          write: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
          delete: when(
            (ctx, _action, resource) => ctx.user.id === resource.authorId
          ),
        },
      },
    });

    const merged = mergePoliciesAny(publicPolicy, ownerPolicy);
    const user: TestContext = { user: { id: "user-1", role: "user" } };
    const publicPost = {
      id: "1",
      authorId: "user-2",
      visibility: "public" as const,
      status: "published" as const,
    };
    const privateOwnPost = {
      id: "2",
      authorId: "user-1",
      visibility: "private" as const,
      status: "draft" as const,
    };
    const privateOtherPost = {
      id: "3",
      authorId: "user-2",
      visibility: "private" as const,
      status: "draft" as const,
    };

    // Can read public post (public policy allows)
    expect(merged.can(user, "read", "post", publicPost)).toBe(true);
    // Can read own private post (owner policy allows)
    expect(merged.can(user, "read", "post", privateOwnPost)).toBe(true);
    // Cannot read other's private post (neither policy allows)
    expect(merged.can(user, "read", "post", privateOtherPost)).toBe(false);
    // Can write own post (owner policy allows)
    expect(merged.can(user, "write", "post", privateOwnPost)).toBe(true);
    // Cannot write other's post (neither policy allows)
    expect(merged.can(user, "write", "post", publicPost)).toBe(false);
  });
});
