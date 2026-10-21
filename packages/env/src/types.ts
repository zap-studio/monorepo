/**
 * Public types for env schemas and the `createEnvironment` function.
 *
 * @module @zap-studio/env/types
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

/**
 * A map of env var names to the Standard Schema that validates them.
 *
 * @example
 * ```ts
 * const vars: EnvironmentVariableSchemaMap = { PORT: z.coerce.number() };
 * ```
 */
export type EnvironmentVariableSchemaMap = Record<string, StandardSchemaV1>;

/**
 * The type a value can have for one key in a resolved env object (for
 * example `process.env` or `import.meta.env`, or dotenv output), before
 * validation.
 */
export type RawEnvironmentVariableValue = boolean | number | string | undefined;

/**
 * Makes sure every key in a `client` shape starts with `TClientPrefix`.
 * This is checked at the type level, and also at runtime by `createEnvironment`.
 */
type PrefixedClientVariableSchemas<
  TClient extends EnvironmentVariableSchemaMap,
  TClientPrefix extends string,
> = {
  [K in keyof TClient]: K extends `${TClientPrefix}${string}` ? TClient[K] : never;
};

/**
 * A reusable env schema, without a runtime env object. It has the
 * `shared`/`server`/`client` shape and `clientPrefix` that `createEnvironment`
 * needs, but not `runtimeEnv` — a schema-only definition cannot provide
 * that.
 *
 * A plain object can be an `EnvironmentSchema`. So a shared base package can export
 * one directly, and an app-specific `createEnvironment` call can use it with
 * `extends` — the same idea as `extends` in `tsconfig.json`.
 *
 * @example
 * ```ts
 * // packages/db/src/env-schema.ts
 * export const dbEnvironmentSchema = {
 *   server: { DATABASE_URL: z.string().url() },
 * } satisfies EnvironmentSchema;
 *
 * // apps/api/src/env.ts
 * export const env = createEnvironment({
 *   extends: [dbEnvironmentSchema],
 *   server: { PORT: z.coerce.number() },
 *   runtimeEnv: process.env,
 * });
 * ```
 */
export interface EnvironmentSchema<
  TShared extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
  TServer extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
  TClient extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
  TClientPrefix extends string = string,
> {
  /** Vars used by both server and client. Validated once. No prefix check. */
  readonly shared?: TShared;
  /** Server-only vars. Not available in client bundles at runtime. */
  readonly server?: TServer;
  /** Vars exposed to the client. Every key must start with `clientPrefix`. */
  readonly client?: PrefixedClientVariableSchemas<TClient, TClientPrefix>;
  /** Required prefix for every `client` key. Checked at both type level and runtime. */
  readonly clientPrefix?: TClientPrefix;
}

/**
 * Gets the parsed output type of a shape map. Returns `Record<string, never>`
 * when the shape is `undefined`, for example when `shared`, `server`, or
 * `client` is left out.
 */
export type InferEnvironmentVariableSchemaMapOutput<TSchemas> =
  TSchemas extends EnvironmentVariableSchemaMap
    ? { [K in keyof TSchemas]: StandardSchemaV1.InferOutput<TSchemas[K]> }
    : Record<string, never>;

/**
 * Gets the combined output type of one `EnvironmentSchema`'s `shared`, `server`,
 * and `client` parts.
 */
type InferEnvironmentSchemaOutput<T> =
  T extends EnvironmentSchema<infer TShared, infer TServer, infer TClient>
    ? InferEnvironmentVariableSchemaMapOutput<TShared> &
        InferEnvironmentVariableSchemaMapOutput<TServer> &
        InferEnvironmentVariableSchemaMapOutput<TClient>
    : never;

/**
 * Turns a union type into an intersection of its members. Used to turn the
 * union of each `extends` entry's output into the intersection that the
 * merged env object really has.
 */
type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (key: TUnion) => void : never
) extends (key: infer TIntersection) => void
  ? TIntersection
  : never;

/**
 * Gets the merged output type of every schema added through `extends`.
 */
export type InferExtendsMergedOutput<TExtends> = TExtends extends readonly EnvironmentSchema[]
  ? UnionToIntersection<InferEnvironmentSchemaOutput<TExtends[number]>>
  : Record<string, never>;

/**
 * Options for `createEnvironment`. Extends `EnvironmentSchema` with the runtime parts a
 * schema-only definition cannot have: the resolved env object to check,
 * the access and validation behavior, and schema composing through
 * `extends`.
 */
export interface CreateEnvironmentOptions<
  TShared extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
  TServer extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
  TClient extends EnvironmentVariableSchemaMap = EnvironmentVariableSchemaMap,
  TClientPrefix extends string = string,
  TExtends extends readonly EnvironmentSchema[] = readonly EnvironmentSchema[],
> extends EnvironmentSchema<TShared, TServer, TClient, TClientPrefix> {
  /**
   * The resolved env object to check (for example `process.env` or
   * `import.meta.env`). It is never scanned at runtime — only the keys the
   * schema declares are read from it. This keeps static bundler
   * replacement of `import.meta.env`/`process.env` working.
   */
  readonly runtimeEnv: Readonly<Record<string, RawEnvironmentVariableValue>>;
  /**
   * Works like `runtimeEnv`, but is used instead of it when given. Useful
   * when you can only build the object to check after `runtimeEnv` would
   * otherwise need to be spread — for example, when framework-injected
   * values are merged with `process.env`.
   */
  readonly runtimeEnvStrict?: Readonly<Record<string, RawEnvironmentVariableValue>>;
  /**
   * Adds other reusable `EnvironmentSchema` definitions to this one before
   * validation. If a key is declared in more than one source (an `extends`
   * entry, or this call's own `shared`/`server`/`client`), `createEnvironment`
   * throws, unless every declaration uses the exact same schema object.
   */
  readonly extends?: TExtends;
  /**
   * How to detect if the code runs on the server. Default:
   * `typeof window === "undefined"`. Set this yourself for edge or SSR
   * contexts where that default is wrong.
   */
  readonly isServer?: boolean;
  /**
   * Skips validation and returns the declared keys from `runtimeEnv` as
   * they are, with no checks. Useful for partial build steps, for example
   * a Docker build stage, where not every var is set yet.
   */
  readonly skipValidation?: boolean;
  /** Treats an empty string (`""`) as `undefined` for every declared key, before validation. */
  readonly emptyStringAsUndefined?: boolean;
  /**
   * Called with the Standard Schema issues for each key when validation
   * fails. Must throw, or never return in any other way. If you leave this
   * out, `createEnvironment` throws an `EnvironmentValidationError`.
   */
  readonly onValidationError?: (
    issues: Readonly<Record<string, readonly StandardSchemaV1.Issue[]>>,
  ) => never;
  /**
   * Called when client-side code reads a server-only key. Must throw, or
   * never return in any other way. If you leave this out, `createEnvironment`
   * throws an `EnvironmentAccessError`.
   */
  readonly onInvalidAccess?: (key: string) => never;
}

/**
 * Gets the parsed, merged output type that `createEnvironment` returns for a given
 * options object: first the `extends` sources, then `shared`, `server`,
 * and `client`.
 */
export type InferCreateEnvironmentOutput<TOptions extends CreateEnvironmentOptions> =
  InferExtendsMergedOutput<TOptions["extends"]> &
    InferEnvironmentVariableSchemaMapOutput<TOptions["shared"]> &
    InferEnvironmentVariableSchemaMapOutput<TOptions["server"]> &
    InferEnvironmentVariableSchemaMapOutput<TOptions["client"]>;

/**
 * One merged env var: which bucket it came from, its schema, and, for a
 * `client` var, the prefix its source used.
 */
export interface ResolvedEnvironmentVariableEntry {
  readonly bucket: "client" | "server" | "shared";
  readonly clientPrefix?: string;
  readonly schema: StandardSchemaV1;
}
