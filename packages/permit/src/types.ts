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
export type Action = string;

/**
 * Represents a resource on which actions can be performed.
 * Typically a string identifier such as "document", "user", etc.
 */
export type Resource = string;

/**
 * Represents the context in which a policy decision is made.
 * Can include user information, environment, or any relevant data.
 */
export type Context = Record<string, unknown>;

/**
 * A function that determines whether a given action on a resource is allowed in a specific context.
 */
export type PolicyFn<TContext, TAction, TResource> = (
  context: TContext,
  action: TAction,
  resource: TResource
) => Decision;

/**
 * A function that evaluates a condition for a given action and resource in a specific context.
 */
export type ConditionFn<TContext, TAction = unknown, TResource = unknown> = (
  context: TContext,
  action: TAction,
  resource: TResource
) => boolean;
