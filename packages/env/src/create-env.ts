/**
 * `createEnvironment`: checks a resolved env object against a `shared`/`server`/
 * `client` shape built from Standard Schema. It can combine reusable
 * `EnvironmentSchema` sources through `extends`.
 *
 * @module @zap-studio/env/create-env
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

import { standardValidateSync } from "@zap-studio/validation";

import type {
  CreateEnvironmentOptions,
  EnvironmentSchema,
  EnvironmentVariableSchemaMap,
  RawEnvironmentVariableValue,
  InferExtendsMergedOutput,
  InferEnvironmentVariableSchemaMapOutput,
  ResolvedEnvironmentVariableEntry,
} from "./types.ts";

import { mergeEnvironmentSchemas } from "./_merge.ts";
import { withValidateSpan } from "./_otel.ts";
import { EnvironmentAccessError, EnvironmentValidationError } from "./errors.ts";

/**
 * Reads `runtimeEnvironmentStrict` if it is given, or `runtimeEnvironment` otherwise.
 * Applies `emptyStringAsUndefined` to every value that the merged schema
 * declares.
 */
const readDeclaredEnvironment = (
  keys: readonly string[],
  options: Pick<
    CreateEnvironmentOptions,
    "emptyStringAsUndefined" | "runtimeEnvironment" | "runtimeEnvironmentStrict"
  >,
) => {
  const source = options.runtimeEnvironmentStrict ?? options.runtimeEnvironment;
  const declared: Record<string, RawEnvironmentVariableValue> = {};

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
const validateDeclaredEnvironment = (
  merged: ReadonlyMap<string, ResolvedEnvironmentVariableEntry>,
  declared: Readonly<Record<string, RawEnvironmentVariableValue>>,
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
 * server-only key. This matches, at runtime, the split that `createEnvironment`'s
 * `server`/`client` options enforce at build time.
 */
const guardClientAccess = (
  parsed: Record<string, unknown>,
  merged: ReadonlyMap<string, ResolvedEnvironmentVariableEntry>,
  onInvalidAccess: ((key: string) => never) | undefined,
) => {
  const assertReadable = (prop: string): void => {
    if (merged.get(prop)?.bucket === "server") {
      if (onInvalidAccess) {
        onInvalidAccess(prop);
        throw new Error(
          `onInvalidAccess did not throw for "${prop}"; it must throw or otherwise never return.`,
        );
      }
      throw new EnvironmentAccessError(prop);
    }
  };

  return new Proxy(parsed, {
    get(target, prop) {
      if (typeof prop !== "string") {
        return undefined;
      }

      assertReadable(prop);
      return target[prop];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === "string") {
        assertReadable(prop);
      }

      return Object.getOwnPropertyDescriptor(target, prop);
    },
  });
};

/**
 * Implementation behind the exported `createEnvironment`. Kept untyped (`unknown`
 * return) on purpose.
 */
const createEnvironmentImpl = (options: CreateEnvironmentOptions): unknown => {
  const merged = mergeEnvironmentSchemas([...(options.extends ?? []), options]);
  const keys = [...merged.keys()];

  if (options.skipValidation === true) {
    return readDeclaredEnvironment(keys, options);
  }

  const parsed = withValidateSpan(() => {
    const declared = readDeclaredEnvironment(keys, options);
    const { issues, parsed: validated } = validateDeclaredEnvironment(merged, declared);

    if (Object.keys(issues).length > 0) {
      if (options.onValidationError) {
        options.onValidationError(issues);
        throw new Error(
          "onValidationError did not throw; it must throw or otherwise never return.",
        );
      }
      throw new EnvironmentValidationError(issues);
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
 * throws. By default it throws an `EnvironmentAccessError`, or does whatever
 * `onInvalidAccess` does instead.
 *
 * @example
 * ```ts
 * import { createEnvironment } from "@zap-studio/env";
 * import { z } from "zod";
 *
 * export const env = createEnvironment({
 *   server: { DATABASE_URL: z.string().url() },
 *   client: { NEXT_PUBLIC_API_URL: z.string().url() },
 *   clientPrefix: "NEXT_PUBLIC_",
 *   runtimeEnvironment: process.env,
 * });
 *
 * env.DATABASE_URL; // server-only, throws if read from a client bundle
 * env.NEXT_PUBLIC_API_URL; // readable everywhere
 * ```
 *
 * @throws {EnvironmentError} If `client` vars are declared without a matching
 *   `clientPrefix`, or if a key is declared by more than one composed
 *   source with a different schema.
 * @throws {EnvironmentValidationError} If validation fails and `onValidationError`
 *   is not provided.
 */
export const createEnvironment =
  // SAFETY: this declared type comes from `TExtends`, `TShared`, `TServer`,
  // and `TClient`. TypeScript cannot write that type as the plain
  // `unknown` that `createEnvironmentImpl` returns. But `createEnvironmentImpl` reads and
  // checks exactly the keys `mergeEnvironmentSchemas` builds from those same type
  // parameters (through `options`). So the real value always matches this
  // declared type.
  createEnvironmentImpl as <
    TShared extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
    TServer extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
    TClient extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
    const TClientPrefix extends string = string,
    const TExtends extends readonly EnvironmentSchema[] = readonly EnvironmentSchema[],
  >(
    options: CreateEnvironmentOptions<TShared, TServer, TClient, TClientPrefix, TExtends>,
  ) => InferExtendsMergedOutput<TExtends> &
    InferEnvironmentVariableSchemaMapOutput<TShared> &
    InferEnvironmentVariableSchemaMapOutput<TServer> &
    InferEnvironmentVariableSchemaMapOutput<TClient>;
