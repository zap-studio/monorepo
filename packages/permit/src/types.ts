import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Represents the possible outcomes of a policy decision.
 * - "allow": The action is permitted.
 * - "deny": The action is not permitted.
 */
export type Decision = "allow" | "deny";

/**
 * Represents the context in which a policy decision is made.
 * Can include user information, environment, or any relevant data.
 */
export type Context<TContext = unknown> = TContext;

/**
 * Represents a role within the system.
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
 * import type { Resources } from "@zap-studio/permit";
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
 * import type { Actions } from "@zap-studio/permit";
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
 */
export type InferResource<
  TResources extends Resources,
  TResourceKey extends keyof TResources,
> = StandardSchemaV1.InferOutput<TResources[TResourceKey]>;

/**
 * Infers the action union type for a specific resource.
 */
export type InferAction<
  TActions extends Record<string, readonly string[]>,
  K extends keyof TActions,
> = TActions[K][number];

/**
 * A function that determines whether a given action on a resource is allowed in a specific context.
 */
export type PolicyFn<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
> = (context: TContext, action: TAction, resource: TResource) => Decision;

/**
 * A function that evaluates a condition for a given action and resource in a specific context.
 */
export type ConditionFn<
  TContext extends Context,
  TAction extends string = string,
  TResource = unknown,
> = (context: TContext, action: TAction, resource: TResource) => boolean;

/**
 * Maps actions to their corresponding policy functions for a specific resource.
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
 */
export type Rules<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
> = {
  [K in keyof TResources & keyof TActions]: ActionPolicyMap<
    TContext,
    InferAction<TActions, K>,
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
export type PermitConfig<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
> = {
  resources: TResources;
  actions: TActions;
  rules: Rules<TContext, TResources, TActions>;
};

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
 * policy.can(ctx, "read", "post", postData); // true or false
 * ```
 */
export type Policy<
  TContext extends Context,
  TResources extends Resources = Resources,
  TActions extends Actions<TResources> = Actions<TResources>,
> = {
  /**
   * Determines if the specified action is permitted on the resource in the given context.
   */
  can<K extends keyof TResources & keyof TActions>(
    context: TContext,
    action: InferAction<TActions, K>,
    resourceType: K,
    resource: InferResource<TResources, K>
  ): boolean;
};
