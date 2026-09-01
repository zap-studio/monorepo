/**
 * Public entrypoint for the env package.
 *
 * Re-exports the full public API. `./presets` and `./errors` are also
 * available as dedicated subpaths for consumers who prefer granular
 * imports. All exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/env
 */

export type { StandardSchemaV1 } from "@zap-studio/validation";

export { createEnv } from "./create-env.ts";
export { EnvAccessError, EnvError, EnvValidationError } from "./errors.ts";
export { generateEnvExample } from "./generate-env-example.ts";
export type {
  CreateEnvOptions,
  EnvSchema,
  EnvVarSchemas,
  InferCreateEnvOutput,
  InferExtendsOutput,
  InferEnvVarsOutput,
} from "./types.ts";
