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
 * Typically a string identifier such as "document", "user", etc.
 */
export type Resource<TResource extends string | number | symbol = string> =
  TResource;

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
  TContext,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
> = (context: TContext, action: TAction, resource: TResource) => Decision;

/**
 * A function that evaluates a condition for a given action and resource in a specific context.
 */
export type ConditionFn<
  TContext,
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
  TContext,
  TAction extends Action = Action,
  TResource extends Resource = Resource,
> = {
  [A in TAction]?: PolicyFn<TContext, A, TResource>;
};

/**
 * Maps resources to their corresponding action maps.
 *
 * Each key is a resource, and the value is an ActionMap that maps actions
 * to policy functions for that resource in the given context.
 *
 * @example
 * const resources: ResourceMap<Context, Resource> = {
 *   user: {
 *     read: (ctx, action, resource) => ctx.user.id === resource.id,
 *     write: (ctx, action, resource) => ctx.user.id === resource.id,
 *   },
 *   post: {
 *     read: (ctx, action, resource) => ctx.user.role === 'admin',
 *     write: (ctx, action, resource) => ctx.user.id === resource.authorId,
 *   },
 * };
 */
export type Resources<
  TContext,
  TResource extends Resource = Resource,
  TAction extends Action = Action,
> = {
  [R in TResource]?: Actions<TContext, TAction, R>;
};
