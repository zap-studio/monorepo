/**
 * Public entrypoint for the permit package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/permit/policy`,
 * `@zap-studio/permit/conditions`, ...) for consumers who prefer granular
 * imports. All exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/permit
 */

export {
  allow,
  and,
  collectInheritedRoles,
  deny,
  has,
  hasRole,
  not,
  or,
  when,
} from "./conditions.js";
export { PolicyError } from "./errors.js";
export {
  createPolicy,
  mergePoliciesEvery,
  mergePoliciesSome,
} from "./policy.js";
export type {
  ActionPolicyMap,
  Actions,
  ConditionFn,
  Context,
  Decision,
  InferAction,
  InferPermission,
  InferResource,
  PermitConfig,
  Policy,
  PolicyFn,
  Resources,
  Role,
  RoleHierarchy,
  Rules,
} from "./types.js";

/**
 * Ensures that a value of type `never` is actually never encountered at runtime.
 * This is useful for exhaustive checks on discriminated unions.
 *
 * @example
 * ```ts
 * type Action = 'read' | 'write'
 *
 * function performAction(action: Action) {
 *   switch (action) {
 *     case 'read':
 *       console.log('Reading...')
 *       break
 *     case 'write':
 *       console.log('Writing...')
 *       break
 *     default:
 *       assertNever(action) // TypeScript will error if a new Action is added but not handled
 *   }
 * }
 * ```
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${String(value)}`);
};
