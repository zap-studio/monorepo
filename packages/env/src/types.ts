/**
 * Public type contracts for env schema composition and `createEnv`.
 *
 * @module @zap-studio/env/types
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

/**
 * A map of env var names to the Standard Schema that validates them.
 *
 * @example
 * ```ts
 * const vars: EnvVarSchemas = { PORT: z.coerce.number() };
 * ```
 */
export type EnvVarSchemas = Record<string, StandardSchemaV1>;

/**
 * The value type an already-resolved env object (`process.env`,
 * `import.meta.env`, dotenv output, ...) can hold for one key, before
 * validation.
 */
export type EnvVarValue = boolean | number | string | undefined;

/**
 * Constrains a `client` shape so every key starts with `TClientPrefix`,
 * enforced at the type level in addition to the runtime check `createEnv`
 * performs.
 */
type ClientVarSchemas<TClient extends EnvVarSchemas, TClientPrefix extends string> = {
  [K in keyof TClient]: K extends `${TClientPrefix}${string}` ? TClient[K] : never;
};

/**
 * A reusable, runtime-independent env schema: the `shared`/`server`/`client`
 * shape and `clientPrefix` a `createEnv` call needs, without the
 * `runtimeEnv` a schema-only definition can't provide.
 *
 * Plain object literals satisfy this interface, so a shared base package
 * can export one directly and an app-specific `createEnv` call composes it
 * via `extends` — the same mental model as `tsconfig.json`'s `extends`.
 *
 * @example
 * ```ts
 * // packages/db/src/env-schema.ts
 * export const dbEnvSchema = {
 *   server: { DATABASE_URL: z.string().url() },
 * } satisfies EnvSchema;
 *
 * // apps/api/src/env.ts
 * export const env = createEnv({
 *   extends: [dbEnvSchema],
 *   server: { PORT: z.coerce.number() },
 *   runtimeEnv: process.env,
 * });
 * ```
 */
export interface EnvSchema<
  TShared extends EnvVarSchemas = EnvVarSchemas,
  TServer extends EnvVarSchemas = EnvVarSchemas,
  TClient extends EnvVarSchemas = EnvVarSchemas,
  TClientPrefix extends string = string,
> {
  /** Vars shared between server and client; validated once, never prefix-checked. */
  readonly shared?: TShared;
  /** Server-only vars; inaccessible from client bundles at runtime. */
  readonly server?: TServer;
  /** Client-exposed vars; every key must start with `clientPrefix`. */
  readonly client?: ClientVarSchemas<TClient, TClientPrefix>;
  /** Required prefix for every `client` key, enforced at both type level and runtime. */
  readonly clientPrefix?: TClientPrefix;
}

/**
 * Infers the parsed output type of a shape map, or `{}` when the shape is
 * `undefined` (an omitted `shared`/`server`/`client` bucket).
 */
export type InferEnvVarsOutput<TSchemas> = TSchemas extends EnvVarSchemas
  ? { [K in keyof TSchemas]: StandardSchemaV1.InferOutput<TSchemas[K]> }
  : Record<string, never>;

/**
 * Infers one `EnvSchema`'s combined `shared`/`server`/`client` output type.
 */
type InferEnvSchemaOutput<T> =
  T extends EnvSchema<infer TShared, infer TServer, infer TClient>
    ? InferEnvVarsOutput<TShared> & InferEnvVarsOutput<TServer> & InferEnvVarsOutput<TClient>
    : never;

/**
 * Converts a union type to an intersection of its members. Used to turn the
 * (distributed) union of each `extends` entry's output into the
 * intersection a merged env object actually has.
 */
type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (key: TUnion) => void : never
) extends (key: infer TIntersection) => void
  ? TIntersection
  : never;

/**
 * Infers the merged output type of every schema composed via `extends`.
 */
export type InferExtendsOutput<TExtends> = TExtends extends readonly EnvSchema[]
  ? UnionToIntersection<InferEnvSchemaOutput<TExtends[number]>>
  : Record<string, never>;

/**
 * Options accepted by `createEnv`. Extends `EnvSchema` with the
 * runtime-specific pieces a schema-only definition can't carry: the
 * resolved env object to validate, access/validation behavior, and
 * composition via `extends`.
 */
export interface CreateEnvOptions<
  TShared extends EnvVarSchemas = EnvVarSchemas,
  TServer extends EnvVarSchemas = EnvVarSchemas,
  TClient extends EnvVarSchemas = EnvVarSchemas,
  TClientPrefix extends string = string,
  TExtends extends readonly EnvSchema[] = readonly EnvSchema[],
> extends EnvSchema<TShared, TServer, TClient, TClientPrefix> {
  /**
   * The resolved env object to validate against (`process.env`,
   * `import.meta.env`, dotenv output, ...). Never scanned or introspected
   * dynamically — only the keys declared by the schema are read from it, so
   * static `import.meta.env`/`process.env` bundler replacement keeps
   * working.
   */
  readonly runtimeEnv: Readonly<Record<string, EnvVarValue>>;
  /**
   * Like `runtimeEnv`, but used in place of it when provided. Useful when
   * the object to validate can only be assembled after `runtimeEnv` would
   * otherwise need to be spread (for example, framework-injected values
   * merged with `process.env`).
   */
  readonly runtimeEnvStrict?: Readonly<Record<string, EnvVarValue>>;
  /**
   * Composes other reusable `EnvSchema` definitions into this one before
   * validation. A key declared by more than one source (across `extends`
   * entries and this call's own `shared`/`server`/`client`) throws unless
   * every declaration is the exact same schema object reference.
   */
  readonly extends?: TExtends;
  /**
   * How to detect a server context. Defaults to `typeof window ===
   * "undefined"`. Override for edge/SSR contexts where that default
   * doesn't hold.
   */
  readonly isServer?: boolean;
  /**
   * Bypasses validation entirely and returns the (unvalidated,
   * unprefixed-checked) declared keys read from `runtimeEnv` as-is. Useful
   * for partial build steps (for example, a Docker build stage) where not
   * every var is available yet.
   */
  readonly skipValidation?: boolean;
  /** Treats `""` as `undefined` for every declared key before validation. */
  readonly emptyStringAsUndefined?: boolean;
  /**
   * Called with the per-key Standard Schema issues when validation fails.
   * Must throw or otherwise never return; when omitted, `createEnv` throws
   * an `EnvValidationError`.
   */
  readonly onValidationError?: (
    issues: Readonly<Record<string, readonly StandardSchemaV1.Issue[]>>,
  ) => never;
  /**
   * Called when client-side code accesses a server-only key. Must throw or
   * otherwise never return; when omitted, `createEnv` throws an
   * `EnvAccessError`.
   */
  readonly onInvalidAccess?: (key: string) => never;
}

/**
 * Infers the parsed, merged output type `createEnv` returns for a given
 * options object: `extends` sources, then `shared`, `server`, and `client`.
 */
export type InferCreateEnvOutput<TOptions extends CreateEnvOptions> = InferExtendsOutput<
  TOptions["extends"]
> &
  InferEnvVarsOutput<TOptions["shared"]> &
  InferEnvVarsOutput<TOptions["server"]> &
  InferEnvVarsOutput<TOptions["client"]>;
