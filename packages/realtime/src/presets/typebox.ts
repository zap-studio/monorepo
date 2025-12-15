import { type TSchema, Type } from "@sinclair/typebox";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * TypeBox schema builder preset
 *
 * This preset provides all the schema building functions needed
 * by the realtime plugins, pre-configured for TypeBox.
 *
 * @example
 * ```ts
 * import { typeboxSchemaBuilder } from "@zap-studio/realtime/presets/typebox";
 * import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";
 *
 * const ChatEvents = createChatEventsSchema(typeboxSchemaBuilder);
 * ```
 */
export const typeboxSchemaBuilder = {
  /**
   * Create an object schema
   */
  object: <T extends Record<string, StandardSchemaV1>>(
    shape: T
  ): StandardSchemaV1<{ [K in keyof T]: StandardSchemaV1.InferOutput<T[K]> }> =>
    Type.Object(
      shape as unknown as Record<string, TSchema>
    ) as unknown as StandardSchemaV1<{
      [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
    }>,

  /**
   * Create a string schema
   */
  string: () => Type.String() as unknown as StandardSchemaV1<string>,

  /**
   * Create a number schema
   */
  number: () => Type.Number() as unknown as StandardSchemaV1<number>,

  /**
   * Create a boolean schema
   */
  boolean: () => Type.Boolean() as unknown as StandardSchemaV1<boolean>,

  /**
   * Create an enum schema
   */
  enum: <T extends readonly [string, ...string[]]>(
    values: T
  ): StandardSchemaV1<T[number]> =>
    Type.Union(
      values.map((v) => Type.Literal(v))
    ) as unknown as StandardSchemaV1<T[number]>,

  /**
   * Create an optional schema
   */
  optional: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | undefined> =>
    Type.Optional(schema as unknown as TSchema) as unknown as StandardSchemaV1<
      StandardSchemaV1.InferOutput<T> | undefined
    >,

  /**
   * Create a record schema
   */
  record: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<Record<string, StandardSchemaV1.InferOutput<T>>> =>
    Type.Record(
      Type.String(),
      schema as unknown as TSchema
    ) as unknown as StandardSchemaV1<
      Record<string, StandardSchemaV1.InferOutput<T>>
    >,

  /**
   * Create an unknown schema
   */
  unknown: () => Type.Unknown() as unknown as StandardSchemaV1<unknown>,

  /**
   * Create an array schema
   */
  array: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T>[]> =>
    Type.Array(schema as unknown as TSchema) as unknown as StandardSchemaV1<
      StandardSchemaV1.InferOutput<T>[]
    >,

  /**
   * Create a nullable schema
   */
  nullable: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | null> =>
    Type.Union([
      schema as unknown as TSchema,
      Type.Null(),
    ]) as unknown as StandardSchemaV1<StandardSchemaV1.InferOutput<T> | null>,

  /**
   * Create a literal schema
   */
  literal: <T extends string | number | boolean>(
    value: T
  ): StandardSchemaV1<T> =>
    Type.Literal(value) as unknown as StandardSchemaV1<T>,

  /**
   * Create a union schema
   */
  union: <
    T extends [StandardSchemaV1, StandardSchemaV1, ...StandardSchemaV1[]],
  >(
    schemas: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T[number]>> =>
    Type.Union(schemas as unknown as TSchema[]) as unknown as StandardSchemaV1<
      StandardSchemaV1.InferOutput<T[number]>
    >,
};

/**
 * Type for the TypeBox schema builder
 */
export type TypeBoxSchemaBuilder = typeof typeboxSchemaBuilder;
