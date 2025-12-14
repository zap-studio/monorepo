import type {
  Action,
  ConditionFn,
  Context,
  Policy,
  PolicyFn,
  Resource,
  Resources,
  Role,
  RoleHierarchy,
} from "./types";

/**
 * Returns a policy function that always allows the action.
 *
 * @example
 * ```ts
 * const policy = allow();
 * policy({ role: "admin" }, "read", "post"); // "allow"
 * policy({ role: "user" }, "read", { type: "post", id: 1 }); // "allow"
 * ```
 */
export function allow<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(): PolicyFn<TContext, TAction, TResource> {
  return () => "allow";
}

/**
 * Returns a policy function that always denies the action.
 *
 * @example
 * ```ts
 * const policy = deny();
 * policy({ role: "user" }, "read", "post"); // "deny"
 * policy({ role: "user" }, "read", { type: "post", id: 1 }); // "deny"
 * ```
 */
export function deny<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(): PolicyFn<TContext, TAction, TResource> {
  return () => "deny";
}

/**
 * Returns a policy function that returns "allow" if the condition is true, otherwise returns "deny".
 *
 * @example
 * ```ts
 * const policy = when((user, action, resource) => user === "admin");
 * policy({ role: "admin" }, "read", "post"); // "allow"
 * policy({ role: "user" }, "read", "post"); // "deny"
 * policy({ role: "user" }, "read", { type: "post", id: 1 }); // "deny"
 * ```
 */
export function when<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(
  condition: ConditionFn<TContext, TAction, TResource>
): PolicyFn<TContext, TAction, TResource> {
  return (context, action, resource) =>
    condition(context, action, resource) ? "allow" : "deny";
}

/**
 * Returns a condition function that returns true if all conditions are true, otherwise returns false.
 *
 * @example
 * ```ts
 * const policy = and((user, action, resource) => user === "admin", (user, action, resource) => action === "read");
 * policy({ role: "admin" }, "read", "post"); // true
 * policy({ role: "admin" }, "write", "post"); // false
 * policy({ role: "user" }, "read", { type: "post", id: 1 }); // false
 * ```
 */
export function and<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(
  ...conditions: ConditionFn<TContext, TAction, TResource>[]
): ConditionFn<TContext, TAction, TResource> {
  return (context, action, resource) =>
    conditions.every((condition) => condition(context, action, resource));
}

/**
 * Returns a condition function that returns true if any condition is true, otherwise returns false.
 *
 * @example
 * ```ts
 * const policy = or((user, action, resource) => user === "admin", (user, action, resource) => action === "read");
 * policy({ role: "admin" }, "read", "post"); // true
 * policy({ role: "user" }, "read", "post"); // true
 * policy({ role: "user" }, "write", { type: "post", id: 1 }); // false
 * ```
 */
export function or<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(
  ...conditions: ConditionFn<TContext, TAction, TResource>[]
): ConditionFn<TContext, TAction, TResource> {
  return (context, action, resource) =>
    conditions.some((condition) => condition(context, action, resource));
}

/**
 * Returns a condition function that returns true if the condition is false, otherwise returns false.
 *
 * @example
 * ```ts
 * const policy = not((user, action, resource) => user === "admin");
 * policy({ role: "admin" }, "read", "post"); // false
 * policy({ role: "user" }, "read", "post"); // true
 * policy({ role: "user" }, "write", { type: "post", id: 1 }); // true
 * ```
 */
export function not<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(
  condition: ConditionFn<TContext, TAction, TResource>
): ConditionFn<TContext, TAction, TResource> {
  return (context, action, resource) => !condition(context, action, resource);
}

/**
 * Returns a condition function that returns true if the user has the specified role, otherwise returns false.
 *
 * @example
 * ```ts
 * const isAdmin = has("role", "admin");
 * isAdmin({ role: "admin" }); // true
 * isAdmin({ role: "user" }); // false
 * ```
 */
export function has<TContext extends Context, K extends keyof TContext>(
  key: K,
  value: TContext[K]
): ConditionFn<TContext> {
  return (context) => context[key] === value;
}

/**
 * Creates a policy object from a mapping of resource types and actions to policy functions.
 *
 * This utility helps you define a policy by providing a map of resource types (strings), each mapping to actions,
 * each mapping to a policy function. The returned policy object exposes a `can` method to check
 * if a given action on a resource is allowed in a specific context.
 *
 * @example
 * type Context = { user: { id: number; role: string } };
 * type Action = "read" | "write";
 * type Post = { type: 'post'; visibility: 'public' | 'private'; authorId: number };
 * type Comment = { type: 'comment'; authorId: number };
 * type MyResource = Post | Comment;
 *
 * const policy = definePolicy<Context, Action, MyResource>(
 *   (resource) => resource.type  // Extract type from object (e.g., 'post' or 'comment')
 * )({
 *   post: {
 *     read: when((ctx, action, resource) => resource.visibility === 'public' || ctx.user.id === resource.authorId),
 *     write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
 *   },
 *   comment: {
 *     read: allow(),
 *     write: deny(),
 *   },
 * });
 *
 * const post: Post = { type: 'post', visibility: 'private', authorId: 123 };
 * policy.can({ user: { id: 123, role: 'user' } }, 'read', post); // true (author match)
 * policy.can({ user: { id: 456, role: 'user' } }, 'read', post); // false (private, not author)
 * policy.can({ user: { id: 123, role: 'user' } }, 'write', comment); // false (always deny writing comment)
 */
export function definePolicy<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(getResourceType?: (resource: TResource) => string) {
  return (
    map: Resources<TContext, TAction, TResource>
  ): Policy<TContext, TAction, TResource> => ({
    can(context, action, resource) {
      let resourceType: string;
      if (getResourceType) {
        resourceType = getResourceType(resource);
      } else {
        resourceType = String(resource); // 'resource' is the type key (string)
      }

      const resourcePolicies = map[resourceType];
      if (!resourcePolicies) {
        return false;
      }

      const policy = resourcePolicies[action];
      if (!policy) {
        return false;
      }

      return policy(context, action, resource) === "allow";
    },
  });
}

/**
 * Merge multiple policies into one.
 *
 * By default, uses "deny-overrides" (fail-closed):
 * - If any policy denies, the merged policy denies.
 * - If all policies allow, the merged policy allows.
 *
 * @example
 * ```ts
 * const policy1 = definePolicy<Context, Action, Resource>()({ post: { read: allow() } });
 * const policy2 = definePolicy<Context, Action, Resource>()({ post: { read: when(ctx => ctx.role === "admin") } });
 * const merged = mergePolicies(policy1, policy2);
 * merged.can({ role: "user" }, "read", "post"); // combined decision (false since policy2 denies if role !== "admin")
 * ```
 */
export function mergePolicies<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(
  ...policies: Policy<TContext, TAction, TResource>[]
): Policy<TContext, TAction, TResource> {
  return {
    can(context, action, resource) {
      // deny-overrides: if any policy denies, the merged policy denies
      for (const p of policies) {
        if (!p.can(context, action, resource)) {
          return false;
        }
      }
      return true;
    },

    explain(context, action, resource) {
      const reasons: string[] = [];
      for (const p of policies) {
        if (p.explain) {
          reasons.push(p.explain(context, action, resource));
        }
      }
      return reasons.join(" AND ");
    },
  };
}

/**
 * Merges policies using "allow-overrides" (fail-open):
 * - If any policy allows, the merged policy allows.
 * - If all policies deny, the merged policy denies.
 *
 * @example
 * ```ts
 * const policy1 = definePolicy<Context, Action, Resource>()({ post: { read: allow() } });
 * const policy2 = definePolicy<Context, Action, Resource>()({ post: { read: when(ctx => ctx.role === "admin") } });
 * const merged = mergePoliciesAny(policy1, policy2);
 * merged.can({ role: "user" }, "read", "post"); // combined decision (true since policy1 allows)
 * ```
 */
export function mergePoliciesAny<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
>(
  ...policies: Policy<TContext, TAction, TResource>[]
): Policy<TContext, TAction, TResource> {
  return {
    can(context, action, resource) {
      return policies.some((p) => p.can(context, action, resource));
    },
  };
}

/**
 * Returns all roles a user has including inherited roles.
 *
 * This function traverses the role hierarchy recursively, collecting all direct and indirect (inherited) roles.
 *
 * @example
 * ```ts
 * type Role = "guest" | "user" | "editor" | "admin" | "moderator" | "superadmin";
 *
 * const hierarchy: Record<Role, Role[]> = {
 *   guest: [],
 *   user: ["guest"],
 *   editor: ["user"],
 *   moderator: ["user"],
 *   admin: ["editor"],
 *   superadmin: ["admin", "moderator"], // superadmin inherits from both admin and moderator
 * };
 *
 * const userRoles: Role[] = ["editor", "moderator"];
 *
 * // User has "editor" and "moderator" roles directly
 * const effectiveRoles = collectInheritedRoles(userRoles, hierarchy);
 * // Result: Set { "editor", "user", "guest", "moderator" }
 *
 * // If user is also a "superadmin":
 * const allRoles = collectInheritedRoles(["superadmin"], hierarchy);
 * // Result: Set { "superadmin", "admin", "editor", "user", "moderator", "guest" }
 * ```
 */
export function collectInheritedRoles<TRole extends Role = Role>(
  roles: TRole[],
  hierarchy: RoleHierarchy<TRole>
): Set<TRole> {
  const inherited = new Set<TRole>();

  function add(role: TRole) {
    if (!inherited.has(role)) {
      inherited.add(role);
      const parents = hierarchy[role] ?? [];
      parents.forEach(add); // recursively add parent roles
    }
  }

  roles.forEach(add);
  return inherited;
}

/**
 * Checks if a user has a specific role, considering the role hierarchy.
 *
 * This function supports both direct role assignment and inherited roles via a hierarchy.
 * The user's roles can be a single value or an array of roles.
 *
 * @example
 * ```ts
 * // User with a single role, no hierarchy
 * const ctx1 = { role: "editor" };
 * const canEdit = hasRole("editor");
 * canEdit(ctx1); // true
 * canEdit({ role: "user" }); // false
 *
 * // User with multiple roles, no hierarchy
 * const ctx2 = { role: ["user", "moderator"] };
 * const canModerate = hasRole("moderator");
 * hasRole("moderator")(ctx2); // true
 * hasRole("admin")(ctx2); // false
 *
 * // With hierarchy: editor inherits from user, admin inherits from editor
 * const hierarchy = {
 *   user: [],
 *   editor: ["user"],
 *   admin: ["editor"],
 * };
 * const ctx3 = { role: "admin" };
 * hasRole("user", hierarchy)(ctx3); // true (admin -> editor -> user)
 * hasRole("editor", hierarchy)(ctx3); // true
 * hasRole("admin", hierarchy)(ctx3); // true
 * hasRole("moderator", hierarchy)(ctx3); // false
 *
 * // User with multiple roles and hierarchy
 * const ctx4 = { role: ["moderator", "editor"] };
 * hasRole("user", hierarchy)(ctx4); // true (editor -> user)
 * hasRole("admin", hierarchy)(ctx4); // false
 * ```
 */
export function hasRole<
  TContext extends Context & { role: TRole | TRole[] },
  TAction extends Action = Action,
  TResource extends Resource = Resource,
  TRole extends Role = Role,
>(
  role: TRole,
  hierarchy?: RoleHierarchy
): ConditionFn<TContext, TAction, TResource> {
  return (context) => {
    const userRoles = Array.isArray(context.role)
      ? context.role
      : [context.role];

    if (!hierarchy) {
      return userRoles.includes(role);
    }

    const inherited = collectInheritedRoles(userRoles, hierarchy);
    return inherited.has(role);
  };
}
