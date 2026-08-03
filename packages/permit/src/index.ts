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
export { assertNever } from "./helpers.js";
export { createPolicy, mergePolicies, mergePoliciesAny } from "./policy.js";
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
