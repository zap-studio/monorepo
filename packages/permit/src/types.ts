/**
 * Represents the possible outcomes of a policy decision.
 * - "allow": The action is permitted.
 * - "deny": The action is not permitted.
 */
export type Decision = "allow" | "deny";

/**
 * Represents an action that can be performed.
 * Typically a string identifier such as "read", "write", etc.
 */
export type Action<TAction extends string | number | symbol = string> = TAction;

/**
 * Represents a resource on which actions can be performed.
 * Can be any type, such as a string identifier or an object with attributes.
 */
export type Resource<TResource = unknown> = TResource;

/**
 * Represents the context in which a policy decision is made.
 * Can include user information, environment, or any relevant data.
 */
export type Context<
  TContext extends Record<string, unknown> = Record<string, unknown>,
> = TContext;

/**
 * A function that determines whether a given action on a resource is allowed in a specific context.
 */
export type PolicyFn<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
> = (context: TContext, action: TAction, resource: TResource) => Decision;

/**
 * A function that evaluates a condition for a given action and resource in a specific context.
 */
export type ConditionFn<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
> = (context: TContext, action: TAction, resource: TResource) => boolean;

/**
 * Maps actions to their corresponding policy functions for a specific resource.
 *
 * Each key is an action, and the value is a policy function that determines
 * whether the action is allowed on the resource in the given context.
 *
 * @example
 * const actions: ActionMap<Context, Action, Resource> = {
 *   read: (ctx, action, resource) => ctx.user.role === 'admin',
 *   write: (ctx, action, resource) => ctx.user.id === resource.id,
 * };
 */
export type Actions<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
> = {
  [A in TAction]?: PolicyFn<TContext, A, TResource>;
};

/**
 * Maps resource types (strings) to their corresponding action maps.
 *
 * Each key is a resource type (e.g., 'post'), and the value is Actions that maps actions
 * to policy functions for resources of that type in the given context.
 *
 * @example
 * const resources: Resources<Context, Action, Resource> = {
 *   post: {
 *     read: (ctx, action, resource) => resource.visibility === 'public',  // resource is object
 *     write: (ctx, action, resource) => ctx.user.id === resource.authorId,
 *   },
 *   comment: {
 *     read: allow(),
 *     write: deny(),
 *   },
 * };
 */
export type Resources<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
> = Record<string, Actions<TContext, TAction, TResource>>;

/**
 * Represents a policy object that can evaluate permissions and optionally provide explanations.
 *
 * An object of this type must implement a `can` method to determine if an action is permitted
 * on a resource in a given context, and may optionally implement an `explain` method to provide
 * a human-readable explanation for the decision.
 */
export type Policy<
  TContext extends Context,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
> = {
  /**
   * Determines if the specified action is permitted on the resource in the given context.
   */
  can(context: TContext, action: TAction, resource: TResource): boolean;

  /**
   * (Optional) Provides a human-readable explanation for the policy decision.
   */
  explain?(context: TContext, action: TAction, resource: TResource): string;
};

/**
 * Represents a role within the system.
 */
export type Role<TRole extends string = string> = TRole;

/**
 * Represents a role hierarchy within the system.
 */
export type RoleHierarchy<TRole extends Role = Role> = Record<TRole, TRole[]>;
