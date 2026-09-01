/**
 * Public entry point for the env package.
 *
 * Re-exports the full public API. `./presets` and `./errors` are also
 * available as separate subpaths, for anyone who wants smaller imports.
 * Every export is side-effect free and tree-shakeable.
 *
 * @module @zap-studio/env
 */

export type { StandardSchemaV1 } from "@zap-studio/validation";

export { createEnvironment } from "./create-env.ts";
export { EnvironmentAccessError, EnvironmentError, EnvironmentValidationError } from "./errors.ts";
export { generateEnvironmentExample } from "./generate-env-example.ts";
export type {
  CreateEnvironmentOptions,
  EnvironmentSchema,
  EnvironmentVariableSchemaMap,
  InferCreateEnvironmentOutput,
  InferExtendsMergedOutput,
  InferEnvironmentVariableSchemaMapOutput,
} from "./types.ts";
