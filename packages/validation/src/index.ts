/**
 * Public entrypoint for the validation package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/validation/validate`,
 * `@zap-studio/validation/errors`) for consumers who prefer granular imports.
 * All exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/validation
 */

export type { StandardSchemaV1, StandardTypedV1 } from "@standard-schema/spec";
export { ValidationError } from "./errors.js";
export {
  createStandardValidator,
  createSyncStandardValidator,
  isStandardSchema,
  standardValidate,
  standardValidateSync,
} from "./validate.js";
export type { StandardValidateOptions } from "./validate.js";
