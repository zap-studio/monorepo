import type { StandardSchemaV1 } from "@standard-schema/spec";
// biome-ignore lint/performance/noNamespaceImport: Valibot requires to use namespace import
import * as v from "valibot";

/**
 * Valibot schema builder preset
 *
 * This preset provides all the schema building functions needed
 * by the realtime plugins, pre-configured for Valibot.
 *
 * @example
 * ```ts
 * import { valibotSchemaBuilder } from "@zap-studio/realtime/presets/valibot";
 * import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";
 *
 * const ChatEvents = createChatEventsSchema(valibotSchemaBuilder);
 * ```
 */
export const valibotSchemaBuilder = {
  /**
   * Create an object schema
   */
  object: <T extends Record<string, StandardSchemaV1>>(
    shape: T
  ): StandardSchemaV1<{ [K in keyof T]: StandardSchemaV1.InferOutput<T[K]> }> =>
    v.object(
      shape as unknown as v.ObjectEntries
    ) as unknown as StandardSchemaV1<{
      [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
    }>,

  /**
   * Create a string schema
   */
  string: (): StandardSchemaV1<string> => v.string(),

  /**
   * Create a number schema
   */
  number: (): StandardSchemaV1<number> => v.number(),

  /**
   * Create a boolean schema
   */
  boolean: (): StandardSchemaV1<boolean> => v.boolean(),

  /**
   * Create an enum schema
   */
  enum: <T extends readonly [string, ...string[]]>(
    values: T
  ): StandardSchemaV1<T[number]> => v.picklist(values),

  /**
   * Create an optional schema
   */
  optional: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | undefined> =>
    v.optional(
      schema as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    ),

  /**
   * Create a record schema
   */
  record: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<Record<string, StandardSchemaV1.InferOutput<T>>> =>
    v.record(
      v.string(),
      schema as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    ),

  /**
   * Create an unknown schema
   */
  unknown: (): StandardSchemaV1<unknown> => v.unknown(),

  /**
   * Create an array schema
   */
  array: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T>[]> =>
    v.array(
      schema as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    ),

  /**
   * Create a nullable schema
   */
  nullable: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | null> =>
    v.nullable(
      schema as unknown as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    ),

  /**
   * Create a literal schema
   */
  literal: <T extends string | number | boolean>(
    value: T
  ): StandardSchemaV1<T> => v.literal(value),

  /**
   * Create a union schema
   */
  union: <
    T extends [StandardSchemaV1, StandardSchemaV1, ...StandardSchemaV1[]],
  >(
    schemas: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T[number]>> =>
    v.union(schemas as unknown as v.UnionOptions),
};

/**
 * Type for the Valibot schema builder
 */
export type ValibotSchemaBuilder = typeof valibotSchemaBuilder;
