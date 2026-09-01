/**
 * Internal schema-level merge shared by `createEnv` and
 * `generateEnvExample`: composes `extends` sources (and a call's own
 * `shared`/`server`/`client`) into one flat key -> schema map, enforcing
 * `clientPrefix` and reference-equality conflict detection.
 *
 * @module @zap-studio/env/merge
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

import type { EnvSchema, EnvVarSchemas } from "./types.ts";

import { EnvError } from "./errors.ts";

/**
 * One merged env var: which bucket it was declared in, its schema, and
 * (for a `client` var) the prefix its source enforced.
 */
export interface MergedEnvEntry {
  readonly bucket: "client" | "server" | "shared";
  readonly clientPrefix?: string;
  readonly schema: StandardSchemaV1;
}

/**
 * Every `client` key in `source` must start with `source.clientPrefix`.
 * Checked per source, not on the merged result, since each composed
 * `EnvSchema` (an `extends` entry or the call's own config) carries its own
 * prefix.
 */
const assertClientPrefix = (source: EnvSchema): void => {
  const keys = source.client === undefined ? [] : Object.keys(source.client);
  if (keys.length === 0) {
    return;
  }

  if (source.clientPrefix === undefined) {
    throw new EnvError('"clientPrefix" is required when "client" vars are declared.');
  }

  for (const key of keys) {
    if (!key.startsWith(source.clientPrefix)) {
      throw new EnvError(
        `Client env var "${key}" does not start with the required prefix "${source.clientPrefix}".`,
      );
    }
  }
};

/**
 * Merges one bucket's shape into `merged`. A key already present must
 * resolve to the exact same schema object reference and the same bucket —
 * Standard Schema has no generic introspection API, so structural
 * schema-equivalence can't be reliably detected, and reference equality is
 * the honest, buildable signal for "safe duplicate" (for example, two
 * packages both importing one shared constant).
 */
const mergeBucket = (
  merged: Map<string, MergedEnvEntry>,
  bucket: MergedEnvEntry["bucket"],
  schemas: EnvVarSchemas | undefined,
  clientPrefix: string | undefined,
): void => {
  if (schemas === undefined) {
    return;
  }

  for (const [key, schema] of Object.entries(schemas)) {
    const existing = merged.get(key);
    if (existing !== undefined) {
      if (existing.schema !== schema || existing.bucket !== bucket) {
        throw new EnvError(
          `Env var "${key}" is declared by more than one composed schema. Reuse the exact same schema object to compose the same key across sources, or rename one of them.`,
        );
      }
      continue;
    }

    merged.set(
      key,
      bucket === "client" && clientPrefix !== undefined
        ? { bucket, clientPrefix, schema }
        : { bucket, schema },
    );
  }
};

/**
 * Merges a list of `EnvSchema` sources (in order — typically `extends`
 * entries followed by the call's own `shared`/`server`/`client`) into one
 * flat key -> schema map.
 *
 * @throws {EnvError} If a `client` var is declared without a `clientPrefix`,
 *   a `client` var doesn't start with its source's `clientPrefix`, or a key
 *   is declared by more than one source with a different schema or bucket.
 */
export const mergeEnvSchemas = (sources: readonly EnvSchema[]): Map<string, MergedEnvEntry> => {
  for (const source of sources) {
    assertClientPrefix(source);
  }

  const merged = new Map<string, MergedEnvEntry>();
  for (const source of sources) {
    mergeBucket(merged, "shared", source.shared, undefined);
    mergeBucket(merged, "server", source.server, undefined);
    mergeBucket(merged, "client", source.client, source.clientPrefix);
  }

  return merged;
};
