/**
 * `generateEnvExample`: builds a `.env.example` file from a schema.
 *
 * @module @zap-studio/env/generate-env-example
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

import type { MergedEnvEntry } from "./_merge.ts";
import type { EnvSchema } from "./types.ts";

import { mergeEnvSchemas } from "./_merge.ts";

const keyCollator = new Intl.Collator("en");

/**
 * Checks if a value looks like a thenable (it has a `then` function). This
 * matches the check that `@zap-studio/validation` uses internally, so it
 * also detects an async schema when the Promise comes from a different
 * JavaScript realm.
 */
const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  // oxlint-disable-next-line github/no-then -- checking for a thenable value here, not chaining a Promise.
  typeof value.then === "function";

/**
 * Checks, as well as it can, if a key can be left out of the resolved env.
 * It calls the schema with `undefined` and checks if that passes. A
 * schema with a default value (`z.string().default("x")`) passes, and so
 * does a schema that is truly optional (`z.string().optional()`). A
 * schema with no default and no `.optional()` fails. Standard Schema has
 * no way to ask "does this have a default", so this check is the only
 * option that works across all schema libraries. An async schema cannot
 * be checked right away, so it is treated as required, to be safe.
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
 * Renders one merged entry as a `.env.example` comment plus an assignment
 * line.
 */
const renderEntry = (key: string, entry: MergedEnvEntry): string => {
  const parts = [entry.bucket, isOptionalOrHasDefault(entry.schema) ? "optional" : "required"];
  if (entry.bucket === "client" && entry.clientPrefix !== undefined) {
    parts.push(`prefix: ${entry.clientPrefix}`);
  }

  return `# ${parts.join(", ")}\n${key}=`;
};

/**
 * Walks through an env schema (the same `shared`/`server`/`client`/`extends`
 * shape that `createEnv` accepts, without the runtime-only options) and
 * builds a `.env.example` file. It writes one line per declared key, with
 * a comment for whether it is `shared`, `server`, or `client`, whether it
 * is required or optional / has a default, and, for `client` keys, the
 * required prefix.
 *
 * It never reads values from a real environment. The output comes only
 * from the schema shape, so it is safe to run in CI and commit.
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
