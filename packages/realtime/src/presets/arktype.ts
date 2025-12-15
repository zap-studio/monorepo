import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type Type, type } from "arktype";

/**
 * ArkType schema builder preset
 *
 * This preset provides all the schema building functions needed
 * by the realtime plugins, pre-configured for ArkType.
 *
 * @example
 * ```ts
 * import { arktypeSchemaBuilder } from "@zap-studio/realtime/presets/arktype";
 * import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";
 *
 * const ChatEvents = createChatEventsSchema(arktypeSchemaBuilder);
 * ```
 */
export const arktypeSchemaBuilder = {
  /**
   * Create an object schema
   */
  object: <T extends Record<string, StandardSchemaV1>>(
    shape: T
  ): StandardSchemaV1<{ [K in keyof T]: StandardSchemaV1.InferOutput<T[K]> }> =>
    type(shape as Record<string, unknown>) as StandardSchemaV1<{
      [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
    }>,

  /**
   * Create a string schema
   */
  string: () => type("string") as StandardSchemaV1<string>,

  /**
   * Create a number schema
   */
  number: () => type("number") as StandardSchemaV1<number>,

  /**
   * Create a boolean schema
   */
  boolean: () => type("boolean") as StandardSchemaV1<boolean>,

  /**
   * Create an enum schema
   */
  enum: <T extends readonly [string, ...string[]]>(
    values: T
  ): StandardSchemaV1<T[number]> => {
    const enumType = type.enumerated(...values);
    return enumType as StandardSchemaV1<T[number]>;
  },

  /**
   * Create an optional schema
   */
  optional: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | undefined> => {
    const arkSchema = schema as unknown as Type<unknown>;
    return arkSchema.or(type("undefined")) as StandardSchemaV1<
      StandardSchemaV1.InferOutput<T> | undefined
    >;
  },

  /**
   * Create a record schema
   */
  record: <T extends StandardSchemaV1>(
    _schema: T
  ): StandardSchemaV1<Record<string, StandardSchemaV1.InferOutput<T>>> => {
    // ArkType record syntax requires special handling
    // Use a permissive object type for records
    return type("object") as StandardSchemaV1<
      Record<string, StandardSchemaV1.InferOutput<T>>
    >;
  },

  /**
   * Create an unknown schema
   */
  unknown: () => type("unknown") as StandardSchemaV1<unknown>,

  /**
   * Create an array schema
   */
  array: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T>[]> => {
    const arkSchema = schema as unknown as Type<unknown>;
    return arkSchema.array() as StandardSchemaV1<
      StandardSchemaV1.InferOutput<T>[]
    >;
  },

  /**
   * Create a nullable schema
   */
  nullable: <T extends StandardSchemaV1>(
    schema: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T> | null> => {
    const arkSchema = schema as unknown as Type<unknown>;
    return arkSchema.or(
      type("null")
    ) as StandardSchemaV1<StandardSchemaV1.InferOutput<T> | null>;
  },

  /**
   * Create a literal schema
   */
  literal: <T extends string | number | boolean>(
    value: T
  ): StandardSchemaV1<T> => type.unit(value) as StandardSchemaV1<T>,

  /**
   * Create a union schema
   */
  union: <
    T extends [StandardSchemaV1, StandardSchemaV1, ...StandardSchemaV1[]],
  >(
    schemas: T
  ): StandardSchemaV1<StandardSchemaV1.InferOutput<T[number]>> => {
    const arkSchemas = schemas as unknown as Type<unknown>[];
    if (arkSchemas.length < 2) {
      return arkSchemas[0] as StandardSchemaV1<
        StandardSchemaV1.InferOutput<T[number]>
      >;
    }
    const first = arkSchemas[0] as Type<unknown>;
    const second = arkSchemas[1] as Type<unknown>;
    let result = first.or(second);
    for (let i = 2; i < arkSchemas.length; i++) {
      result = result.or(arkSchemas[i] as Type<unknown>);
    }
    return result as StandardSchemaV1<StandardSchemaV1.InferOutput<T[number]>>;
  },
};

/**
 * Type for the ArkType schema builder
 */
export type ArkTypeSchemaBuilder = typeof arktypeSchemaBuilder;
