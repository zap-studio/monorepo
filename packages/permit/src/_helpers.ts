/**
 * Internal helper utilities. Not part of the public API.
 *
 * @module @zap-studio/permit/_helpers
 */

import type { Actions, InferAction, Resources } from "./types.js";

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

/**
 * Splits a typed `resource:action` permission string into its parts.
 * Returns `null` when the string is malformed (missing/empty part or extra segments).
 */
export const parsePermission = <
  TResources extends Resources,
  TActions extends Actions<TResources>,
  K extends keyof TResources & keyof TActions,
>(
  permission: `${K & string}:${InferAction<TResources, TActions, K> & string}`
): { action: InferAction<TResources, TActions, K>; resourceType: K } | null => {
  const [resourceTypeValue, actionValue, ...rest] = permission.split(":");
  if (
    resourceTypeValue === undefined ||
    resourceTypeValue.length === 0 ||
    actionValue === undefined ||
    actionValue.length === 0 ||
    rest.length > 0
  ) {
    return null;
  }

  return {
    action: actionValue,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Parsed permission strings are constrained by the typed permission template.
    resourceType: resourceTypeValue as K,
  };
};
