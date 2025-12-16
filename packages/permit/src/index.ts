import type { StandardSchemaV1 } from "@standard-schema/spec";
import { PolicyError } from "./errors";
import type {
  Actions,
  ConditionFn,
  Context,
  InferAction,
  InferResource,
  PermitConfig,
  Policy,
  PolicyFn,
  Resources,
  Role,
  RoleHierarchy,
} from "./types";

/**
 * Returns a policy function that always allows the action.
 *
 * @example
 * ```ts
 * const policy = createPolicy({
 *   resources,
 *   actions,
 *   rules: {
 *     post: {
 *       read: allow(), // Always allow reading posts
 *     },
 *   },
 * });
 * ```
 */
export function allow<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
>(): PolicyFn<TContext, TAction, TResource> {
  return () => "allow";
}

/**
 * Returns a policy function that always denies the action.
 *
 * @example
 * ```ts
 * const policy = createPolicy({
 *   resources,
 *   actions,
 *   rules: {
 *     post: {
 *       delete: deny(), // Never allow deleting posts
 *     },
 *   },
 * });
 * ```
 */
export function deny<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
>(): PolicyFn<TContext, TAction, TResource> {
  return () => "deny";
}

/**
 * Returns a policy function that allows or denies based on a condition.
 *
 * @example
 * ```ts
 * const policy = createPolicy({
 *   resources,
 *   actions,
 *   rules: {
 *     post: {
 *       write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
 *     },
 *   },
 * });
 * ```
 */
export function when<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
>(
  condition: ConditionFn<TContext, TAction, TResource>
): PolicyFn<TContext, TAction, TResource> {
  return (context, action, resource) =>
    condition(context, action, resource) ? "allow" : "deny";
}

/**
 * Returns a condition function that returns `true` if all conditions are met.
 *
 * @example
 * ```ts
 * const isOwnerAndPublished = and(
 *   (ctx, action, resource) => ctx.user.id === resource.authorId,
 *   (ctx, action, resource) => resource.status === "published"
 * );
 *
 * rules: {
 *   post: {
 *     delete: when(isOwnerAndPublished),
 *   },
 * }
 * ```
 */
export function and<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
>(
  ...conditions: ConditionFn<TContext, TAction, TResource>[]
): ConditionFn<TContext, TAction, TResource> {
  return (context, action, resource) =>
    conditions.every((condition) => condition(context, action, resource));
}

/**
 * Returns a condition function that returns `true` if any condition is met.
 *
 * @example
 * ```ts
 * const isOwnerOrAdmin = or(
 *   (ctx, action, resource) => ctx.user.id === resource.authorId,
 *   (ctx, action, resource) => ctx.user.role === "admin"
 * );
 *
 * rules: {
 *   post: {
 *     write: when(isOwnerOrAdmin),
 *   },
 * }
 * ```
 */
export function or<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
>(
  ...conditions: ConditionFn<TContext, TAction, TResource>[]
): ConditionFn<TContext, TAction, TResource> {
  return (context, action, resource) =>
    conditions.some((condition) => condition(context, action, resource));
}

/**
 * Returns a condition function that negates another condition.
 *
 * @example
 * ```ts
 * const isNotOwner = not((ctx, action, resource) => ctx.user.id === resource.authorId);
 *
 * rules: {
 *   post: {
 *     like: when(isNotOwner), // Can only like posts you don't own
 *   },
 * }
 * ```
 */
export function not<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
>(
  condition: ConditionFn<TContext, TAction, TResource>
): ConditionFn<TContext, TAction, TResource> {
  return (context, action, resource) => !condition(context, action, resource);
}

/**
 * Returns a condition function that checks if a context property equals a value.
 *
 * @example
 * ```ts
 * rules: {
 *   post: {
 *     write: when(has("role", "admin")), // Only admins can write
 *   },
 * }
 * ```
 */
export function has<TContext extends Context, K extends keyof TContext>(
  key: K,
  value: TContext[K]
): ConditionFn<TContext> {
  return (context) => context[key] === value;
}

/**
 * Collects all roles including inherited ones from a role hierarchy.
 *
 * @example
 * ```ts
 * type Role = "guest" | "user" | "admin";
 *
 * const hierarchy: RoleHierarchy<Role> = {
 *   guest: [],
 *   user: ["guest"],
 *   admin: ["user"],
 * };
 *
 * collectInheritedRoles(["admin"], hierarchy);
 * // Returns: Set { "admin", "user", "guest" }
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
 * Returns a condition function that checks if the user has a specific role.
 * Supports role hierarchy for inherited permissions.
 *
 * @example
 * ```ts
 * // Without hierarchy
 * rules: {
 *   post: {
 *     delete: when(hasRole("admin")),
 *   },
 * }
 *
 * // With hierarchy
 * const hierarchy = {
 *   guest: [],
 *   user: ["guest"],
 *   admin: ["user"],
 * };
 *
 * rules: {
 *   post: {
 *     read: when(hasRole("guest", hierarchy)), // Admins and users can also read
 *   },
 * }
 * ```
 */
export function hasRole<
  TContext extends Context & { role: Role | Role[] },
  TAction extends string = string,
  TResource = unknown,
>(role: Role): ConditionFn<TContext, TAction, TResource>;

export function hasRole<
  TContext extends Context & { role: TRole | TRole[] },
  TAction extends string = string,
  TResource = unknown,
  TRole extends Role = Role,
>(
  role: TRole,
  hierarchy: RoleHierarchy<TRole>
): ConditionFn<TContext, TAction, TResource>;

export function hasRole<
  TContext extends Context & { role: Role | Role[] },
  TAction extends string = string,
  TResource = unknown,
>(
  role: Role,
  hierarchy?: RoleHierarchy<Role>
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

/**
 * Creates a type-safe policy from resource schemas, actions, and rules.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createPolicy, allow, deny, when } from "@zap-studio/permit";
 * import type { Resources, Actions } from "@zap-studio/permit/types";
 *
 * // Define resource schemas
 * const resources = {
 *   post: z.object({
 *     id: z.string(),
 *     authorId: z.string(),
 *     visibility: z.enum(["public", "private"]),
 *   }),
 *   comment: z.object({
 *     id: z.string(),
 *     postId: z.string(),
 *     authorId: z.string(),
 *   }),
 * } satisfies Resources;
 *
 * // Define actions per resource
 * const actions = {
 *   post: ["read", "write", "delete"],
 *   comment: ["read", "write"],
 * } as const satisfies Actions<typeof resources>;
 *
 * // Define context type
 * type AppContext = { user: { id: string; role: string } };
 *
 * // Create the policy
 * const policy = createPolicy<AppContext>({
 *   resources,
 *   actions,
 *   rules: {
 *     post: {
 *       read: when((ctx, action, resource) => resource.visibility === "public"),
 *       write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
 *       delete: deny(),
 *     },
 *     comment: {
 *       read: allow(),
 *       write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
 *     },
 *   },
 * });
 *
 * // Check permissions
 * const post = { id: "1", authorId: "user-1", visibility: "public" as const };
 * policy.can(ctx, "read", "post", post); // true
 * policy.can(ctx, "write", "post", post); // depends on ctx.user.id
 * ```
 */
export function createPolicy<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  config: PermitConfig<TContext, TResources, TActions>
): Policy<TContext, TResources, TActions> {
  const { rules, resources, actions } = config;
  const validators = new Map<
    keyof TResources,
    (input: unknown) => StandardSchemaV1.Result<unknown>
  >();

  const getValidatedResource = <K extends keyof TResources>(
    resourceType: K,
    resource: InferResource<TResources, K>
  ): InferResource<TResources, K> | null => {
    const validator = validators.get(resourceType);
    if (!validator) {
      return null;
    }
    try {
      const result = validator(resource);
      if (result.issues) {
        return null;
      }
      return result.value as InferResource<TResources, K>;
    } catch {
      return null;
    }
  };

  for (const key of Object.keys(resources) as Array<keyof TResources>) {
    const schema = resources[key];
    if (!schema) {
      throw new PolicyError(`Missing schema for resource: ${String(key)}`);
    }
    validators.set(key, (input: unknown) => {
      const result = schema["~standard"].validate(input);
      if (result instanceof Promise) {
        throw new PolicyError(
          "Async schemas are not supported in createPolicy"
        );
      }
      return result;
    });
  }

  return {
    can<K extends keyof TResources & keyof TActions>(
      context: TContext,
      action: InferAction<TActions, K>,
      resourceType: K,
      resource: InferResource<TResources, K>
    ): boolean {
      const allowedActions = actions[resourceType];
      if (!allowedActions) {
        return false;
      }
      if (!allowedActions.includes(action)) {
        return false;
      }

      const validatedResource = getValidatedResource(resourceType, resource);
      if (!validatedResource) {
        return false;
      }

      const resourceRules = rules[resourceType];
      if (!resourceRules) {
        return false;
      }

      const policyFn = resourceRules[action];

      if (!policyFn) {
        return false;
      }

      try {
        return policyFn(context, action, validatedResource) === "allow";
      } catch {
        return false;
      }
    },
  };
}

/**
 * Merges multiple policies into one using "deny-overrides" strategy.
 * If any policy denies, the merged policy denies. All must allow for the result to allow.
 *
 * @example
 * ```ts
 * const basePolicy = createPolicy({ ... });
 * const adminPolicy = createPolicy({ ... });
 *
 * const merged = mergePolicies(basePolicy, adminPolicy);
 * // Both policies must allow for the action to be permitted
 * ```
 */
export function mergePolicies<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  ...policies: Policy<TContext, TResources, TActions>[]
): Policy<TContext, TResources, TActions> {
  return {
    can<K extends keyof TResources & keyof TActions>(
      context: TContext,
      action: InferAction<TActions, K>,
      resourceType: K,
      resource: InferResource<TResources, K>
    ): boolean {
      if (!policies.length) {
        return false;
      }
      for (const policy of policies) {
        if (!policy.can(context, action, resourceType, resource)) {
          return false;
        }
      }
      return true;
    },
  };
}

/**
 * Merges multiple policies into one using "allow-overrides" strategy.
 * If any policy allows, the merged policy allows. All must deny for the result to deny.
 *
 * @example
 * ```ts
 * const guestPolicy = createPolicy({ ... });
 * const memberPolicy = createPolicy({ ... });
 *
 * const merged = mergePoliciesAny(guestPolicy, memberPolicy);
 * // If either policy allows, the action is permitted
 * ```
 */
export function mergePoliciesAny<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
>(
  ...policies: Policy<TContext, TResources, TActions>[]
): Policy<TContext, TResources, TActions> {
  return {
    can<K extends keyof TResources & keyof TActions>(
      context: TContext,
      action: InferAction<TActions, K>,
      resourceType: K,
      resource: InferResource<TResources, K>
    ): boolean {
      if (!policies.length) {
        return false;
      }
      return policies.some((policy) =>
        policy.can(context, action, resourceType, resource)
      );
    },
  };
}
