import type { StandardSchemaV1 } from "@standard-schema/spec";
import { ValidationError } from "./errors";

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
 * The returned function always resolves to a Standard Schema result, even when
 * the underlying schema validates synchronously.
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
): (
  input: unknown
) => Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>> {
  return async (
    input: unknown
  ): Promise<
    StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
  > => {
    let result = schema["~standard"].validate(input);
    if (result instanceof Promise) {
      result = await result;
    }
    return result;
  };
}

/**
 * Creates a synchronous Standard Schema validator.
 *
 * This helper calls `schema["~standard"].validate` and throws if the schema
 * performs asynchronous validation.
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
): (
  input: unknown
) => StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>> {
  return (
    input: unknown
  ): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>> => {
    const result = schema["~standard"].validate(input);
    if (result instanceof Promise) {
      throw new Error(
        "Async schemas are not supported by createSyncStandardValidator"
      );
    }
    return result;
  };
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
