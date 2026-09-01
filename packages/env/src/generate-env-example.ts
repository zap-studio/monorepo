/**
 * `generateEnvExample`: schema-driven `.env.example` generation.
 *
 * @module @zap-studio/env/generate-env-example
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

import type { MergedEnvEntry } from "./_merge.ts";
import type { EnvSchema } from "./types.ts";

import { mergeEnvSchemas } from "./_merge.ts";

const keyCollator = new Intl.Collator("en");

/**
 * Duck-types a value as a thenable, matching the check
 * `@zap-studio/validation` uses internally, so an async schema is detected
 * even for a Promise constructed in a different JavaScript realm.
 */
const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  // oxlint-disable-next-line github/no-then -- detecting a thenable, not chaining a Promise.
  typeof value.then === "function";

/**
 * Best-effort check for whether a key can be omitted from the resolved env:
 * calls the schema with `undefined` and reports whether that passes. A
 * schema with a default value (`z.string().default("x")`) or that's
 * genuinely optional (`z.string().optional()`) both pass; a schema with no
 * default and no `.optional()` fails. Standard Schema exposes no
 * introspection API for "has a default", so this is the only
 * vendor-agnostic signal available — an async schema can't be checked
 * synchronously and is conservatively reported as required.
 */
const isOptionalOrHasDefault = (schema: StandardSchemaV1): boolean => {
  try {
    const result = schema["~standard"].validate(undefined);
    return !isPromiseLike(result) && !result.issues;
  } catch {
    return false;
  }
};

/**
 * Renders one merged entry as its `.env.example` comment + assignment.
 */
const renderEntry = (key: string, entry: MergedEnvEntry): string => {
  const parts = [entry.bucket, isOptionalOrHasDefault(entry.schema) ? "optional" : "required"];
  if (entry.bucket === "client" && entry.clientPrefix !== undefined) {
    parts.push(`prefix: ${entry.clientPrefix}`);
  }

  return `# ${parts.join(", ")}\n${key}=`;
};

/**
 * Walks an env schema (the same `shared`/`server`/`client`/`extends` shape
 * `createEnv` accepts, minus the runtime-specific options) and emits a
 * `.env.example` file: one line per declared key, commented with whether
 * it's `shared`/`server`/`client`, required vs optional/has-a-default, and
 * (for `client` keys) the enforced prefix.
 *
 * No values are read from any actual environment — the output is derived
 * from the schema shape alone, so it's safe to run in CI and commit.
 *
 * @example
 * ```ts
 * import { writeFileSync } from "node:fs";
 * import { generateEnvExample } from "@zap-studio/env";
 *
 * writeFileSync(".env.example", generateEnvExample({
 *   server: { DATABASE_URL: z.string().url() },
 *   client: { NEXT_PUBLIC_API_URL: z.string().url() },
 *   clientPrefix: "NEXT_PUBLIC_",
 * }));
 * ```
 *
 * @throws {EnvError} If `client` vars are declared without a matching
 *   `clientPrefix`, or if a key is declared by more than one composed
 *   source with a different schema.
 */
export const generateEnvExample = (
  options: EnvSchema & { readonly extends?: readonly EnvSchema[] },
): string => {
  const merged = mergeEnvSchemas([...(options.extends ?? []), options]);
  const entries = [...merged.entries()].sort((a, b) => keyCollator.compare(a[0], b[0]));

  if (entries.length === 0) {
    return "";
  }

  return entries
    .map(([key, entry]) => renderEntry(key, entry))
    .join("\n\n")
    .concat("\n");
};
