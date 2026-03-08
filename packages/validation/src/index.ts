/**
 * This module provides utilities for validating data against the Standard Schema specification.
 *
 * It includes functions for synchronous and asynchronous validation, as well as helpers for
 * creating reusable validator functions. The module also defines types and options for
 * customizing validation behavior.
 *
 * Main Exports:
 * - `StandardSchemaV1`: Standard Schema specification.
 * - `isStandardSchema`: Checks if a value conforms to the Standard Schema interface.
 * - `createStandardValidator`: Creates an asynchronous validator for a given schema.
 * - `createSyncStandardValidator`: Creates a synchronous validator for a given schema.
 * - `standardValidate`: Validates data asynchronously against a schema.
 * - `standardValidateSync`: Validates data synchronously against a schema.
 *
 * This module is designed to work with the `@standard-schema/spec` package and throws
 * `ValidationError` for validation failures when configured to do so.
 */

import type { StandardSchemaV1 } from "@standard-schema/spec";
import { ValidationError } from "./errors";

/**
 * Standard Schema specification.
 */
export type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Options for validation helpers.
 */
export interface StandardValidateOptions {
  /**
   * When `true`, a {@link ValidationError} will be thrown if validation fails.
   *
   * When `false` or omitted, the raw validation result is returned.
   */
  throwOnError?: boolean;
}

/**
 * Checks whether a value implements the Standard Schema interface.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a Standard Schema, otherwise `false`.
 *
 * @example
 * ```ts
 * if (isStandardSchema(value)) {
 *   console.log("Value is a Standard Schema");
 * }
 * ```
 */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    "~standard" in value
  );
}

/**
 * Creates an async Standard Schema validator.
 *
 * The returned function supports the same options and return modes as
 * {@link standardValidate}, including `throwOnError`.
 *
 * @typeParam TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @returns An async validator function.
 *
 * @example
 * ```ts
 * const validateUser = createStandardValidator(userSchema);
 *
 * const result = await validateUser({
 *   name: "Ada",
 *   age: 37,
 * });
 *
 * if (result.issues) {
 *   console.error("Validation failed", result.issues);
 * } else {
 *   console.log("Validation passed", result.value);
 * }
 * ```
 */
export function createStandardValidator<TSchema extends StandardSchemaV1>(
  schema: TSchema
): {
  (
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true }
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;
  (
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false | undefined }
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;
} {
  async function validate(
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true }
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  async function validate(
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false | undefined }
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  async function validate(
    input: unknown,
    options: StandardValidateOptions = {}
  ): Promise<
    | StandardSchemaV1.InferOutput<TSchema>
    | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
  > {
    if (options.throwOnError) {
      return await standardValidate(schema, input, {
        ...options,
        throwOnError: true,
      });
    }

    return await standardValidate(
      schema,
      input,
      options as StandardValidateOptions & { throwOnError?: false | undefined }
    );
  }

  return validate;
}

/**
 * Creates a synchronous Standard Schema validator.
 *
 * The returned function supports the same options and return modes as
 * {@link standardValidateSync}, including `throwOnError`.
 *
 * @typeParam TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @returns A synchronous validator function.
 * @throws {Error} If the schema performs asynchronous validation.
 *
 * @example
 * ```ts
 * const validateUser = createSyncStandardValidator(userSchema);
 *
 * const result = validateUser({
 *   name: "Ada",
 *   age: 37,
 * });
 *
 * if (result.issues) {
 *   console.error("Validation failed", result.issues);
 * } else {
 *   console.log("Validation passed", result.value);
 * }
 * ```
 */
export function createSyncStandardValidator<TSchema extends StandardSchemaV1>(
  schema: TSchema
): {
  (
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true }
  ): StandardSchemaV1.InferOutput<TSchema>;
  (
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false | undefined }
  ): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;
} {
  function validate(
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true }
  ): StandardSchemaV1.InferOutput<TSchema>;

  function validate(
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false | undefined }
  ): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;

  function validate(
    input: unknown,
    options: StandardValidateOptions = {}
  ):
    | StandardSchemaV1.InferOutput<TSchema>
    | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>> {
    try {
      if (options.throwOnError) {
        return standardValidateSync(schema, input, {
          ...options,
          throwOnError: true,
        });
      }

      return standardValidateSync(
        schema,
        input,
        options as StandardValidateOptions & {
          throwOnError?: false | undefined;
        }
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Async schemas are not supported by standardValidateSync"
      ) {
        throw new Error(
          "Async schemas are not supported by createSyncStandardValidator"
        );
      }

      throw error;
    }
  }

  return validate;
}

/**
 * Validates a value against a Standard Schema.
 *
 * When `throwOnError` is `true`, this function returns the parsed value and
 * throws a {@link ValidationError} if validation fails.
 *
 * When `throwOnError` is `false`, this function returns the raw Standard Schema
 * result.
 *
 * @typeParam TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @param input - The value to validate.
 * @param options - Options for validation behavior.
 * @returns The parsed value or the raw validation result.
 * @throws {ValidationError} If validation fails and `throwOnError` is `true`.
 *
 * @example
 * ```ts
 * const user = await standardValidate(userSchema, data, { throwOnError: true });
 * console.log(user.name);
 * ```
 *
 * @example
 * ```ts
 * const result = await standardValidate(userSchema, data, {
 *   throwOnError: false,
 * });
 *
 * if (result.issues) {
 *   console.error("Validation failed", result.issues);
 * } else {
 *   console.log("Validation passed", result.value);
 * }
 * ```
 */
export async function standardValidate<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  options: StandardValidateOptions & { throwOnError: true }
): Promise<StandardSchemaV1.InferOutput<TSchema>>;

export async function standardValidate<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  options?: StandardValidateOptions & { throwOnError?: false | undefined }
): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

export async function standardValidate<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  options: StandardValidateOptions = {}
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) {
    result = await result;
  }

  if (result.issues) {
    if (options.throwOnError) {
      throw new ValidationError([...result.issues]);
    }
    return result;
  }

  return options.throwOnError ? result.value : result;
}

/**
 * Synchronously validates a value against a Standard Schema.
 *
 * When `throwOnError` is `true`, this function returns the parsed value and
 * throws a {@link ValidationError} if validation fails.
 *
 * When `throwOnError` is `false`, this function returns the raw Standard Schema
 * result.
 *
 * This function throws if the schema performs asynchronous validation.
 *
 * @typeParam TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @param input - The value to validate.
 * @param options - Options for validation behavior.
 * @returns The parsed value or the raw validation result.
 * @throws {Error} If the schema performs asynchronous validation.
 * @throws {ValidationError} If validation fails and `throwOnError` is `true`.
 *
 * @example
 * ```ts
 * const user = standardValidateSync(userSchema, data, { throwOnError: true });
 * console.log(user.name);
 * ```
 *
 * @example
 * ```ts
 * const result = standardValidateSync(userSchema, data, {
 *   throwOnError: false,
 * });
 *
 * if (result.issues) {
 *   console.error("Validation failed", result.issues);
 * } else {
 *   console.log("Validation passed", result.value);
 * }
 * ```
 */
export function standardValidateSync<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  options: StandardValidateOptions & { throwOnError: true }
): StandardSchemaV1.InferOutput<TSchema>;

export function standardValidateSync<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  options?: StandardValidateOptions & { throwOnError?: false | undefined }
): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;

export function standardValidateSync<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  options: StandardValidateOptions = {}
):
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>> {
  const result = schema["~standard"].validate(input);

  if (result instanceof Promise) {
    throw new Error("Async schemas are not supported by standardValidateSync");
  }

  if (result.issues) {
    if (options.throwOnError) {
      throw new ValidationError([...result.issues]);
    }
    return result;
  }

  return options.throwOnError ? result.value : result;
}
