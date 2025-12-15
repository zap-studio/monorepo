import type { StandardSchemaV1 } from "@standard-schema/spec";
import { z } from "zod";

/**
 * Zod schema builder preset
 *
 * This preset provides all the schema building functions needed
 * by the realtime plugins, pre-configured for Zod.
 *
 * @example
 * ```ts
 * import { zodSchemaBuilder } from "@zap-studio/realtime/presets/zod";
 * import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";
 *
 * const ChatEvents = createChatEventsSchema(zodSchemaBuilder);
 * ```
 */
export const zodSchemaBuilder = {
  /**
   * Create an object schema
   */
  object: <T extends Record<string, StandardSchemaV1>>(
    shape: T
  ): StandardSchemaV1<{ [K in keyof T]: StandardSchemaV1.InferOutput<T[K]> }> =>
    z.object(shape as unknown as z.ZodRawShape) as StandardSchemaV1<{
      [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
    }>,

  /**
   * Create a string schema
   */
  string: (): StandardSchemaV1<string> => z.string(),

  /**
   * Create a number schema
   */
  number: (): StandardSchemaV1<number> => z.number(),

  /**
   * Create a boolean schema
   */
  boolean: (): StandardSchemaV1<boolean> => z.boolean(),

  /**
   * Create an enum schema
   */
  enum: <T extends readonly [string, ...string[]]>(
    values: T
  ): StandardSchemaV1<T[number]> => z.enum(values),

  /**
   * Create an optional schema
   */
  optional: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | undefined> =>
    (schema as unknown as z.ZodType).optional(),

  /**
   * Create a record schema
   */
  record: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<Record<string, StandardSchemaV1.InferOutput<T>>> =>
    z.record(z.string(), schema as unknown as z.ZodType),

  /**
   * Create an unknown schema
   */
  unknown: (): StandardSchemaV1<unknown> => z.unknown(),

  /**
   * Create an array schema
   */
  array: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T>[]> =>
    z.array(schema as unknown as z.ZodType),

  /**
   * Create a nullable schema
   */
  nullable: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | null> =>
    (schema as unknown as z.ZodType).nullable(),

  /**
   * Create a literal schema
   */
  literal: <T extends string | number | boolean>(
    value: T
  ): StandardSchemaV1<T> => z.literal(value),

  /**
   * Create a union schema
   */
  union: <
    T extends [StandardSchemaV1, StandardSchemaV1, ...StandardSchemaV1[]],
  >(
    schemas: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T[number]>> =>
    z.union(schemas as unknown as [z.ZodType, z.ZodType, ...z.ZodType[]]),
};

/**
 * Type for the Zod schema builder
 */
export type ZodSchemaBuilder = typeof zodSchemaBuilder;
