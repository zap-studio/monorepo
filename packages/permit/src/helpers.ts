/**
 * Helper utilities for permit consumers.
 *
 * @module @zap-studio/permit/helpers
 */

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
