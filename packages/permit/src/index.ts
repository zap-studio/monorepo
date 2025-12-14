import type { Action, ConditionFn, PolicyFn, Resource } from "./types";

/**
 * Returns a policy function that always allows the action.
 *
 * @example
 * ```ts
 * const policy = allow();
 * policy({ role: "admin" }, "read", "post"); // "allow"
 * ```
 */
export function allow<
  TContext,
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
 * ```
 */
export function deny<
  TContext,
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
 * ```
 */
export function when<
  TContext,
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
 * ```
 */
export function and<
  TContext,
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
 * ```
 */
export function or<
  TContext,
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
 * ```
 */
export function not<
  TContext,
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
export function has<
  TContext extends Record<string, unknown>,
  K extends keyof TContext,
>(key: K, value: TContext[K]): ConditionFn<TContext> {
  return (context) => context[key] === value;
}
