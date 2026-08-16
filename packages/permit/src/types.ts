/**
 * Public type contracts for permit policies and configuration.
 *
 * @module @zap-studio/permit/types
 */

import type { Logger } from "@zap-studio/logger";
import type { StandardSchemaV1 } from "@zap-studio/validation";

/**
 * Represents the possible outcomes of a policy decision.
 * - "allow": The action is permitted.
 * - "deny": The action is not permitted.
 *
 * @example
 * ```ts
 * const decision: Decision = "allow";
 * ```
 */
export type Decision = "allow" | "deny";

/**
 * Represents the context in which a policy decision is made.
 * Can include user information, environment, or any relevant data.
 *
 * @example
 * ```ts
 * type AppContext = Context<{ user: { id: string; role: string } }>;
 * ```
 */
export type Context<TContext = unknown> = TContext;

/**
 * Represents a role within the system.
 *
 * @example
 * ```ts
 * type AppRole = Role<"guest" | "user" | "admin">;
 * ```
 */
export type Role<TRole extends string = string> = TRole;

/**
 * Represents a role hierarchy within the system.
 * Maps each role to an array of roles it inherits from.
 *
 * @example
 * ```ts
 * type Roles = "guest" | "user" | "admin";
 *
 * const hierarchy: RoleHierarchy<Roles> = {
 *   guest: [],
 *   user: ["guest"],
 *   admin: ["user"],
 * };
 * ```
 */
export type RoleHierarchy<TRole extends Role = Role> = Record<TRole, TRole[]>;

/**
 * Type helper for defining resource schemas using Standard Schema.
 * Use with `satisfies` to ensure type safety when defining resources.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import type { Resources } from "@zap-studio/permit/types";
 *
 * const resources = {
 *   post: z.object({ id: z.string(), authorId: z.string() }),
 *   comment: z.object({ id: z.string(), postId: z.string() }),
 * } satisfies Resources;
 * ```
 */
export type Resources<TResourceKey extends string = string> = Record<
  TResourceKey,
  StandardSchemaV1
>;

/**
 * Type helper for defining actions per resource.
 * Use with `satisfies` to ensure keys match the resource definitions.
 *
 * @example
 * ```ts
 * import type { Actions } from "@zap-studio/permit/types";
 *
 * const actions = {
 *   post: ["read", "write", "delete"],
 *   comment: ["read", "write"],
 * } as const satisfies Actions<typeof resources>;
 * ```
 */
export type Actions<TResources extends Resources> = {
  [K in keyof TResources]: readonly string[];
};

/**
 * Infers the output type from a Standard Schema.
 *
 * @example
 * ```ts
 * type Post = InferResource<typeof resources, "post">;
 * ```
 */
export type InferResource<
  TResources extends Resources,
  TResourceKey extends keyof TResources,
> = StandardSchemaV1.InferOutput<TResources[TResourceKey]>;

/**
 * Infers the action union type for a specific resource.
 *
 * @example
 * ```ts
 * type PostAction = InferAction<typeof resources, typeof actions, "post">;
 * // "read" | "write" | "delete"
 * ```
 */
export type InferAction<
  TResources extends Resources,
  TActions extends Actions<TResources>,
  K extends keyof TActions,
> = TActions[K][number];

/**
 * Infers the permission-string union for all resource/action combinations.
 *
 * @example
 * ```ts
 * type Permission = InferPermission<typeof resources, typeof actions>;
 * // "post:read" | "post:write" | "comment:read"
 * ```
 */
export type InferPermission<
  TResources extends Resources,
  TActions extends Actions<TResources>,
> = {
  [
    K in keyof TResources & keyof TActions
  ]: `${K & string}:${InferAction<TResources, TActions, K> & string}`;
}[keyof TResources & keyof TActions];

/**
 * A function that determines whether a given action on a resource is allowed in a specific context.
 *
 * @example
 * ```ts
 * const readPolicy: PolicyFn<AppContext, "read", Post> = (context, action, post) =>
 *   post.visibility === "public" ? "allow" : "deny";
 * ```
 */
export type PolicyFn<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
> = (context: TContext, action: TAction, resource: TResource) => Decision;

/**
 * A function that evaluates a condition for a given action and resource in a specific context.
 *
 * @example
 * ```ts
 * const isOwner: ConditionFn<AppContext, "write", Post> = (context, action, post) =>
 *   context.user.id === post.authorId;
 * ```
 */
export type ConditionFn<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
> = (context: TContext, action: TAction, resource: TResource) => boolean;

/**
 * Call signatures for {@link hasRole}, preserving the with/without hierarchy overloads.
 */
export interface HasRoleFn {
  /**
   * Checks membership in `role` only, with no inherited roles.
   *
   * @param role - Role the context's `role` (or `role[]`) must include.
   */
  <
    TContext extends { role: Role | Role[] },
    TAction extends string = string,
    TResource = unknown,
  >(
    role: Role
  ): ConditionFn<TContext, TAction, TResource>;
  /**
   * Checks membership in `role`, treating any role that inherits from it
   * (per `hierarchy`) as also satisfying the check.
   *
   * @param role - Role the context's `role` (or `role[]`) must include or inherit.
   * @param hierarchy - Maps each role to the roles it inherits from.
   */
  <
    TContext extends { role: TRole | TRole[] },
    TAction extends string = string,
    TResource = unknown,
    TRole extends Role = Role,
  >(
    role: TRole,
    hierarchy: RoleHierarchy<TRole>
  ): ConditionFn<TContext, TAction, TResource>;
}

/**
 * Maps actions to their corresponding policy functions for a specific resource.
 *
 * @example
 * ```ts
 * import type { ActionPolicyMap } from "@zap-studio/permit/types";
 *
 * type PostActions = "read" | "write" | "delete";
 *
 * const postPolicies: ActionPolicyMap<AppContext, PostActions, Post> = {
 *   read: (context, action, post) => "allow",
 *   write: (context, action, post) =>
 *     post.authorId === context.userId ? "allow" : "deny",
 * };
 * ```
 */
export type ActionPolicyMap<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
> = {
  [A in TAction]?: PolicyFn<TContext, A, TResource>;
};

/**
 * Defines the rules for each resource and action combination.
 * Each resource key maps to an object where each action key maps to a policy function.
 *
 * @example
 * ```ts
 * import type { Rules } from "@zap-studio/permit/types";
 *
 * const rules: Rules<AppContext, typeof resources, typeof actions> = {
 *   post: {
 *     read: (context, action, post) => "allow",
 *     write: (context, action, post) =>
 *       post.authorId === context.userId ? "allow" : "deny",
 *   },
 *   comment: {
 *     read: (context, action, comment) => "allow",
 *   },
 * };
 * ```
 */
export type Rules<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
> = {
  [K in keyof TResources & keyof TActions]: ActionPolicyMap<
    TContext,
    InferAction<TResources, TActions, K>,
    InferResource<TResources, K>
  >;
};

/**
 * Configuration object for creating a permit policy.
 *
 * @example
 * ```ts
 * const config: PermitConfig<MyContext> = {
 *   resources,
 *   actions,
 *   rules: {
 *     post: { read: allow(), write: deny() },
 *   },
 * };
 * ```
 */
export interface PermitConfig<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
> {
  /**
   * Allowed actions per resource type. Determines which `resource:action`
   * permission strings are valid to check with `Policy.can(...)`.
   */
  actions: TActions;
  /**
   * Optional logger for policy evaluation internals. When omitted, nothing
   * is logged.
   *
   * Logs allow decisions at `debug` and deny decisions at `info`.
   */
  logger?: Logger;
  /**
   * Standard Schema resource definitions, keyed by resource type. Each
   * resource is validated against its schema before rules are evaluated.
   */
  resources: TResources;
  /**
   * Policy functions for each resource/action combination, deciding
   * `"allow"` or `"deny"` for a given context and resource.
   */
  rules: Rules<TContext, TResources, TActions>;
}

/**
 * Represents a policy object that can evaluate permissions.
 * The `can` method checks if a given action is permitted on a resource in a specific context.
 *
 * @example
 * ```ts
 * const policy: Policy<MyContext> = createPolicy({
 *   resources,
 *   actions,
 *   rules: { ... },
 * });
 *
 * await policy.can(ctx, "post:read", postData); // true or false
 * ```
 */
export interface Policy<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
> {
  /**
   * Determines if the specified action is permitted on the resource in the given context.
   */
  can: <K extends keyof TResources & keyof TActions>(
    context: TContext,
    permission: `${K & string}:${InferAction<TResources, TActions, K> & string}`,
    resource: InferResource<TResources, K>
  ) => Promise<boolean>;
}
