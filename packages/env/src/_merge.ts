/**
 * Internal schema merge used by both `createEnvironment` and `generateEnvironmentExample`.
 * It combines `extends` sources, and a call's own `shared`/`server`/`client`,
 * into one flat map from key to schema. It also checks `clientPrefix` and
 * finds conflicts by comparing schema references.
 *
 * @module @zap-studio/env/merge
 */

import type {
  EnvironmentSchema,
  EnvironmentVariableSchemaMap,
  ResolvedEnvironmentVariableEntry,
} from "./types.ts";

import { EnvironmentError } from "./errors.ts";

/**
 * Every `client` key in `source` must start with `source.clientPrefix`.
 * This is checked for each source on its own, not on the merged result,
 * because each `EnvironmentSchema` (an `extends` entry or the call's own config)
 * has its own prefix.
 */
const assertClientPrefix = (source: EnvironmentSchema): void => {
  const keys = source.client === undefined ? [] : Object.keys(source.client);
  if (keys.length === 0) {
    return;
  }

  if (source.clientPrefix === undefined) {
    throw new EnvironmentError('"clientPrefix" is required when "client" vars are declared.');
  }

  for (const key of keys) {
    if (!key.startsWith(source.clientPrefix)) {
      throw new EnvironmentError(
        `Client env var "${key}" does not start with the required prefix "${source.clientPrefix}".`,
      );
    }
  }
};

/**
 * Merges one bucket's shape into `merged`. If a key already exists, it
 * must use the exact same schema object and the same bucket. Standard
 * Schema has no general way to check if two schemas are the same, so we
 * compare object references instead. This is a simple and reliable way to
 * detect a safe duplicate — for example, when two packages import the
 * same shared constant.
 */
const mergeBucket = (
  merged: Map<string, ResolvedEnvironmentVariableEntry>,
  bucket: ResolvedEnvironmentVariableEntry["bucket"],
  schemas: EnvironmentVariableSchemaMap | undefined,
  clientPrefix: string | undefined,
): void => {
  if (schemas === undefined) {
    return;
  }

  for (const [key, schema] of Object.entries(schemas)) {
    const existing = merged.get(key);
    if (existing !== undefined) {
      if (existing.schema !== schema || existing.bucket !== bucket) {
        throw new EnvironmentError(
          `Environment variable "${key}" is declared by more than one composed schema. Reuse the exact same schema object to compose the same key across sources, or rename one of them.`,
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
 * Merges a list of `EnvironmentSchema` sources, in order, into one flat map from
 * key to schema. This is usually the `extends` entries, followed by the
 * call's own `shared`, `server`, and `client`.
 *
 * @throws {EnvironmentError} If a `client` var is declared without a `clientPrefix`,
 *   a `client` var doesn't start with its source's `clientPrefix`, or a key
 *   is declared by more than one source with a different schema or bucket.
 */
export const mergeEnvironmentSchemas = (
  sources: readonly EnvironmentSchema[],
): Map<string, ResolvedEnvironmentVariableEntry> => {
  for (const source of sources) {
    assertClientPrefix(source);
  }

  const merged = new Map<string, ResolvedEnvironmentVariableEntry>();
  for (const source of sources) {
    mergeBucket(merged, "shared", source.shared, undefined);
    mergeBucket(merged, "server", source.server, undefined);
    mergeBucket(merged, "client", source.client, source.clientPrefix);
  }

  return merged;
};
