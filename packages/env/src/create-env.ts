/**
 * `createEnv`: checks a resolved env object against a `shared`/`server`/
 * `client` shape built from Standard Schema. It can combine reusable
 * `EnvSchema` sources through `extends`.
 *
 * @module @zap-studio/env/create-env
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

import { standardValidateSync } from "@zap-studio/validation";

import type {
  CreateEnvOptions,
  EnvSchema,
  EnvVarSchemas,
  EnvVarValue,
  InferExtendsOutput,
  InferEnvVarsOutput,
  MergedEnvEntry,
} from "./types.ts";

import { mergeEnvSchemas } from "./_merge.ts";
import { withValidateSpan } from "./_otel.ts";
import { EnvAccessError, EnvValidationError } from "./errors.ts";

/**
 * Reads `runtimeEnvStrict` if it is given, or `runtimeEnv` otherwise.
 * Applies `emptyStringAsUndefined` to every value that the merged schema
 * declares.
 */
const readDeclaredEnv = (
  keys: readonly string[],
  options: Pick<CreateEnvOptions, "emptyStringAsUndefined" | "runtimeEnv" | "runtimeEnvStrict">,
) => {
  const source = options.runtimeEnvStrict ?? options.runtimeEnv;
  const declared: Record<string, EnvVarValue> = {};

  for (const key of keys) {
    const value = source[key];
    declared[key] = options.emptyStringAsUndefined === true && value === "" ? undefined : value;
  }

  return declared;
};

/**
 * Checks `declared` against `merged`. Collects every key's issues instead
 * of stopping at the first one.
 */
const validateDeclaredEnv = (
  merged: ReadonlyMap<string, MergedEnvEntry>,
  declared: Readonly<Record<string, EnvVarValue>>,
) => {
  const parsed: Record<string, unknown> = {};
  const issues: Record<string, readonly StandardSchemaV1.Issue[]> = {};

  for (const [key, entry] of merged) {
    const result = standardValidateSync(declared[key], entry.schema, { throwOnError: false });
    if (result.issues) {
      issues[key] = result.issues;
    } else {
      parsed[key] = result.value;
    }
  }

  return { issues, parsed };
};

/**
 * Wraps `parsed` in a `Proxy` that throws when client-side code reads a
 * server-only key. This matches, at runtime, the split that `createEnv`'s
 * `server`/`client` options enforce at build time.
 */
const guardClientAccess = (
  parsed: Record<string, unknown>,
  merged: ReadonlyMap<string, MergedEnvEntry>,
  onInvalidAccess: ((key: string) => never) | undefined,
) =>
  new Proxy(parsed, {
    get(target, prop) {
      if (typeof prop !== "string") {
        return undefined;
      }

      if (merged.get(prop)?.bucket === "server") {
        if (onInvalidAccess) {
          onInvalidAccess(prop);
          throw new Error(
            `onInvalidAccess did not throw for "${prop}"; it must throw or otherwise never return.`,
          );
        }
        throw new EnvAccessError(prop);
      }

      return target[prop];
    },
  });

/**
 * Implementation behind the exported `createEnv`. Kept untyped (`unknown`
 * return) on purpose.
 */
const createEnvImpl = (options: CreateEnvOptions): unknown => {
  const merged = mergeEnvSchemas([...(options.extends ?? []), options]);
  const keys = [...merged.keys()];

  if (options.skipValidation === true) {
    return readDeclaredEnv(keys, options);
  }

  const parsed = withValidateSpan(() => {
    const declared = readDeclaredEnv(keys, options);
    const { issues, parsed: validated } = validateDeclaredEnv(merged, declared);

    if (Object.keys(issues).length > 0) {
      if (options.onValidationError) {
        options.onValidationError(issues);
        throw new Error(
          "onValidationError did not throw; it must throw or otherwise never return.",
        );
      }
      throw new EnvValidationError(issues);
    }

    return validated;
  });

  const isServer = options.isServer ?? typeof window === "undefined";
  if (isServer) {
    return parsed;
  }

  return guardClientAccess(parsed, merged, options.onInvalidAccess);
};

/**
 * Creates a validated env object from a `shared`/`server`/`client` shape
 * built from Standard Schema.
 *
 * On the server, every declared var (`shared`, `server`, and `client`) can
 * be read. Off the server (`isServer: false`, or when the `typeof window
 * === "undefined"` default is `false`), reading a `server`-only key
 * throws. By default it throws an `EnvAccessError`, or does whatever
 * `onInvalidAccess` does instead.
 *
 * @example
 * ```ts
 * import { createEnv } from "@zap-studio/env";
 * import { z } from "zod";
 *
 * export const env = createEnv({
 *   server: { DATABASE_URL: z.string().url() },
 *   client: { NEXT_PUBLIC_API_URL: z.string().url() },
 *   clientPrefix: "NEXT_PUBLIC_",
 *   runtimeEnv: process.env,
 * });
 *
 * env.DATABASE_URL; // server-only, throws if read from a client bundle
 * env.NEXT_PUBLIC_API_URL; // readable everywhere
 * ```
 *
 * @throws {EnvError} If `client` vars are declared without a matching
 *   `clientPrefix`, or if a key is declared by more than one composed
 *   source with a different schema.
 * @throws {EnvValidationError} If validation fails and `onValidationError`
 *   is not provided.
 */
export const createEnv =
  // SAFETY: this declared type comes from `TExtends`, `TShared`, `TServer`,
  // and `TClient`. TypeScript cannot write that type as the plain
  // `unknown` that `createEnvImpl` returns. But `createEnvImpl` reads and
  // checks exactly the keys `mergeEnvSchemas` builds from those same type
  // parameters (through `options`). So the real value always matches this
  // declared type.
  createEnvImpl as <
    TShared extends EnvVarSchemas = EnvVarSchemas,
    TServer extends EnvVarSchemas = EnvVarSchemas,
    TClient extends EnvVarSchemas = EnvVarSchemas,
    const TClientPrefix extends string = string,
    const TExtends extends readonly EnvSchema[] = readonly EnvSchema[],
  >(
    options: CreateEnvOptions<TShared, TServer, TClient, TClientPrefix, TExtends>,
  ) => InferExtendsOutput<TExtends> &
    InferEnvVarsOutput<TShared> &
    InferEnvVarsOutput<TServer> &
    InferEnvVarsOutput<TClient>;
