/**
 * Policy and condition combinators: `allow`, `deny`, `when`, boolean
 * composition, and role helpers.
 *
 * @module @zap-studio/permit/conditions
 */

import type {
  ConditionFn,
  Context,
  HasRoleFn,
  PolicyFn,
  Role,
  RoleHierarchy,
} from "./types.js";

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
export const allow =
  <
    TContext extends Context,
    TAction extends string = string,
    TResource = unknown,
  >(): PolicyFn<TContext, TAction, TResource> =>
  () =>
    "allow";

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
export const deny =
  <
    TContext extends Context,
    TAction extends string = string,
    TResource = unknown,
  >(): PolicyFn<TContext, TAction, TResource> =>
  () =>
    "deny";

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
export const when =
  <
    TContext extends Context,
    TAction extends string = string,
    TResource = unknown,
  >(
    condition: ConditionFn<TContext, TAction, TResource>
  ): PolicyFn<TContext, TAction, TResource> =>
  (context, action, resource) =>
    condition(context, action, resource) ? "allow" : "deny";

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
export const and =
  <
    TContext extends Context,
    TAction extends string = string,
    TResource = unknown,
  >(
    ...conditions: ConditionFn<TContext, TAction, TResource>[]
  ): ConditionFn<TContext, TAction, TResource> =>
  (context, action, resource) =>
    conditions.every((condition) => condition(context, action, resource));

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
export const or =
  <
    TContext extends Context,
    TAction extends string = string,
    TResource = unknown,
  >(
    ...conditions: ConditionFn<TContext, TAction, TResource>[]
  ): ConditionFn<TContext, TAction, TResource> =>
  (context, action, resource) =>
    conditions.some((condition) => condition(context, action, resource));

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
export const not =
  <
    TContext extends Context,
    TAction extends string = string,
    TResource = unknown,
  >(
    condition: ConditionFn<TContext, TAction, TResource>
  ): ConditionFn<TContext, TAction, TResource> =>
  (context, action, resource) =>
    !condition(context, action, resource);

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
export const has =
  <TContext extends Context, K extends keyof TContext>(
    key: K,
    value: TContext[K]
  ): ConditionFn<TContext> =>
  (context) =>
    context[key] === value;

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
export const collectInheritedRoles = <TRole extends Role = Role>(
  roles: TRole[],
  hierarchy: RoleHierarchy<TRole>
): Set<TRole> => {
  const inherited = new Set<TRole>();

  const add = (role: TRole): void => {
    if (inherited.has(role)) {
      return;
    }

    inherited.add(role);
    const parents = hierarchy[role] ?? [];
    for (const parent of parents) {
      add(parent);
    }
  };

  for (const role of roles) {
    add(role);
  }
  return inherited;
};

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
export const hasRole: HasRoleFn =
  (
    role: Role,
    hierarchy?: RoleHierarchy
  ): ConditionFn<{ role: Role | Role[] }> =>
  (context) => {
    const userRoles = Array.isArray(context.role)
      ? context.role
      : [context.role];

    if (hierarchy === undefined) {
      return userRoles.includes(role);
    }

    const inherited = collectInheritedRoles(userRoles, hierarchy);
    return inherited.has(role);
  };
