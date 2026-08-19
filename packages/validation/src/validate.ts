/**
 * Standard Schema validation helpers.
 *
 * Provides synchronous and asynchronous validation against any Standard
 * Schema compatible library (Zod, Valibot, ArkType, ...), plus factories for
 * reusable validator functions.
 *
 * @module @zap-studio/validation/validate
 */

import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Result } from "@zap-studio/monads";

import { err, ok, ResultAsync } from "@zap-studio/monads";

import { ValidationError } from "./errors.ts";

/**
 * Callable contract for {@link standardValidate}, factored out so the
 * overloaded implementation can be assigned a named type instead of an
 * anonymous object type.
 */
export interface StandardValidateFn {
  <TSchema extends StandardSchemaV1>(
    input: unknown,
    schema: TSchema,
    options: StandardValidateOptions & { throwOnError: true },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  <TSchema extends StandardSchemaV1>(
    input: unknown,
    schema: TSchema,
    options?: StandardValidateOptions & { throwOnError?: false },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;
}

/**
 * Callable contract for {@link standardValidateSync}, factored out so the
 * overloaded implementation can be assigned a named type instead of an
 * anonymous object type.
 */
export interface StandardValidateSyncFn {
  <TSchema extends StandardSchemaV1>(
    input: unknown,
    schema: TSchema,
    options: StandardValidateOptions & { throwOnError: true },
  ): StandardSchemaV1.InferOutput<TSchema>;

  <TSchema extends StandardSchemaV1>(
    input: unknown,
    schema: TSchema,
    options?: StandardValidateOptions & { throwOnError?: false },
  ): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;
}

/**
 * Options for validation helpers.
 *
 * @example
 * ```ts
 * const options: StandardValidateOptions = { throwOnError: true };
 * ```
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
export const isStandardSchema = (value?: unknown): value is StandardSchemaV1 =>
  value !== null &&
  value !== undefined &&
  (typeof value === "object" || typeof value === "function") &&
  "~standard" in value;

/**
 * Validates a value against a Standard Schema.
 *
 * When `throwOnError` is `true`, this function returns the parsed value and
 * throws a {@link ValidationError} if validation fails.
 *
 * When `throwOnError` is `false`, this function returns the raw Standard Schema
 * result.
 *
 * @template TSchema - The Standard Schema type.
 * @param input - The value to validate.
 * @param schema - The schema to validate against.
 * @param options - Options for validation behavior.
 * @returns The parsed value or the raw validation result.
 * @throws {ValidationError} If validation fails and `throwOnError` is `true`.
 * @throws {TypeError} If the provided value does not expose a callable Standard Schema
 *   `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown or rejected by the schema's Standard Schema
 *   `validate` function.
 *
 * @example
 * ```ts
 * const user = await standardValidate(data, userSchema, { throwOnError: true });
 * console.log(user.name);
 * ```
 *
 * @example
 * ```ts
 * const result = await standardValidate(data, userSchema, {
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
export const standardValidate: StandardValidateFn = async <TSchema extends StandardSchemaV1>(
  input: unknown,
  schema: TSchema,
  options?: StandardValidateOptions,
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
> => {
  const throwOnError = options?.throwOnError === true;
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) {
    result = await result;
  }

  if (result.issues) {
    if (throwOnError) {
      throw new ValidationError(result.issues);
    }
    return result;
  }

  return throwOnError ? result.value : result;
};

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
 * @template TSchema - The Standard Schema type.
 * @param input - The value to validate.
 * @param schema - The schema to validate against.
 * @param options - Options for validation behavior.
 * @returns The parsed value or the raw validation result.
 * @throws {Error} If the schema performs asynchronous validation. The message is
 *   `Async schemas are not supported by standardValidateSync`.
 * @throws {ValidationError} If validation fails and `throwOnError` is `true`.
 * @throws {TypeError} If the provided value does not expose a callable Standard Schema
 *   `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown by the schema's Standard Schema `validate` function.
 *
 * @example
 * ```ts
 * const user = standardValidateSync(data, userSchema, { throwOnError: true });
 * console.log(user.name);
 * ```
 *
 * @example
 * ```ts
 * const result = standardValidateSync(data, userSchema, {
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
export const standardValidateSync: StandardValidateSyncFn = <TSchema extends StandardSchemaV1>(
  input: unknown,
  schema: TSchema,
  options?: StandardValidateOptions,
):
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>> => {
  const throwOnError = options?.throwOnError === true;
  const result = schema["~standard"].validate(input);

  if (result instanceof Promise) {
    throw new TypeError("Async schemas are not supported by standardValidateSync");
  }

  if (result.issues) {
    if (throwOnError) {
      throw new ValidationError(result.issues);
    }
    return result;
  }

  return throwOnError ? result.value : result;
};

/**
 * Creates an async Standard Schema validator.
 *
 * The returned function supports the same options and return modes as
 * {@link standardValidate}, including `throwOnError`.
 *
 * @template TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @returns An async validator function.
 * @throws {ValidationError} When the returned validator is called with
 *   `throwOnError: true` and validation returns issues.
 * @throws {TypeError} When the returned validator is called and the provided value does not
 *   expose a callable Standard Schema `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown or rejected by the schema's Standard Schema
 *   `validate` function when the returned validator is called.
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
export const createStandardValidator = <TSchema extends StandardSchemaV1>(
  schema: TSchema,
): {
  (
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;
  (
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;
} => {
  async function validate(
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  async function validate(
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  async function validate(
    input: unknown,
    options?: StandardValidateOptions,
  ): Promise<
    | StandardSchemaV1.InferOutput<TSchema>
    | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
  > {
    if (options?.throwOnError === true) {
      return await standardValidate(input, schema, { throwOnError: true });
    }

    return await standardValidate(input, schema, {
      throwOnError: false,
    });
  }

  return validate;
};

/**
 * Creates a synchronous Standard Schema validator.
 *
 * The returned function supports the same options and return modes as
 * {@link standardValidateSync}, including `throwOnError`.
 *
 * @template TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @returns A synchronous validator function.
 * @throws {Error} When the returned validator receives a schema result Promise.
 *   The message is `Async schemas are not supported by createStandardValidatorSync`.
 * @throws {ValidationError} When the returned validator is called with
 *   `throwOnError: true` and validation returns issues.
 * @throws {TypeError} When the returned validator is called and the provided value does not
 *   expose a callable Standard Schema `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown by the schema's Standard Schema `validate` function
 *   when the returned validator is called.
 *
 * @example
 * ```ts
 * const validateUser = createStandardValidatorSync(userSchema);
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
export const createStandardValidatorSync = <TSchema extends StandardSchemaV1>(
  schema: TSchema,
): {
  (
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true },
  ): StandardSchemaV1.InferOutput<TSchema>;
  (
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false },
  ): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;
} => {
  function validate(
    input: unknown,
    options: StandardValidateOptions & { throwOnError: true },
  ): StandardSchemaV1.InferOutput<TSchema>;

  function validate(
    input: unknown,
    options?: StandardValidateOptions & { throwOnError?: false },
  ): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;

  function validate(
    input: unknown,
    options?: StandardValidateOptions,
  ):
    | StandardSchemaV1.InferOutput<TSchema>
    | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>> {
    try {
      if (options?.throwOnError === true) {
        return standardValidateSync(input, schema, { throwOnError: true });
      }

      return standardValidateSync(input, schema, {
        throwOnError: false,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Async schemas are not supported by standardValidateSync"
      ) {
        throw new Error("Async schemas are not supported by createStandardValidatorSync", {
          cause: error,
        });
      }

      throw error;
    }
  }

  return validate;
};

/**
 * Synchronously validates a value against a Standard Schema, returning a
 * `Result` instead of throwing or returning the raw Standard Schema result.
 *
 * Only validation issues become `Err`. A malformed schema, or a schema that
 * performs asynchronous validation, still throws — those are programmer
 * errors, not values a caller should branch on.
 *
 * This function throws if the schema performs asynchronous validation.
 *
 * @template TSchema - The Standard Schema type.
 * @param input - The value to validate.
 * @param schema - The schema to validate against.
 * @returns `Ok` with the parsed value, or `Err` with a {@link ValidationError}.
 * @throws {Error} If the schema performs asynchronous validation. The message is
 *   `Async schemas are not supported by standardValidateResultSync`.
 * @throws {TypeError} If the provided value does not expose a callable Standard Schema
 *   `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown by the schema's Standard Schema `validate` function.
 *
 * @example
 * ```ts
 * const result = standardValidateResultSync(data, userSchema);
 *
 * if (isOk(result)) {
 *   console.log(result.value);
 * } else {
 *   console.error(result.error.issues);
 * }
 * ```
 */
export const standardValidateResultSync = <TSchema extends StandardSchemaV1>(
  input: unknown,
  schema: TSchema,
): Result<StandardSchemaV1.InferOutput<TSchema>, ValidationError> => {
  const result = schema["~standard"].validate(input);

  if (result instanceof Promise) {
    throw new TypeError("Async schemas are not supported by standardValidateResultSync");
  }

  return result.issues ? err(new ValidationError(result.issues)) : ok(result.value);
};

/**
 * Validates a value against a Standard Schema, returning a `ResultAsync`
 * instead of throwing or returning the raw Standard Schema result.
 *
 * Only validation issues become `Err`. A malformed schema still throws —
 * that is a programmer error, not a value a caller should branch on.
 *
 * @template TSchema - The Standard Schema type.
 * @param input - The value to validate.
 * @param schema - The schema to validate against.
 * @returns A `ResultAsync` resolving to `Ok` with the parsed value, or `Err` with a
 *   {@link ValidationError}.
 * @throws {TypeError} If the provided value does not expose a callable Standard Schema
 *   `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown or rejected by the schema's Standard Schema
 *   `validate` function.
 *
 * @example
 * ```ts
 * const result = await standardValidateResult(data, userSchema);
 *
 * if (isOk(result)) {
 *   console.log(result.value);
 * } else {
 *   console.error(result.error.issues);
 * }
 * ```
 */
export const standardValidateResult = <TSchema extends StandardSchemaV1>(
  input: unknown,
  schema: TSchema,
): ResultAsync<StandardSchemaV1.InferOutput<TSchema>, ValidationError> =>
  new ResultAsync(
    (async (): Promise<Result<StandardSchemaV1.InferOutput<TSchema>, ValidationError>> => {
      let result = schema["~standard"].validate(input);
      if (result instanceof Promise) {
        result = await result;
      }

      return result.issues ? err(new ValidationError(result.issues)) : ok(result.value);
    })(),
  );

/**
 * Creates a synchronous Standard Schema validator that returns a `Result`.
 *
 * The returned function behaves like {@link standardValidateResultSync}, bound
 * to `schema`.
 *
 * @template TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @returns A synchronous validator function returning a `Result`.
 * @throws {Error} When the returned validator receives a schema result Promise.
 *   The message is `Async schemas are not supported by createStandardValidatorResultSync`.
 * @throws {TypeError} When the returned validator is called and the provided value does not
 *   expose a callable Standard Schema `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown by the schema's Standard Schema `validate` function
 *   when the returned validator is called.
 *
 * @example
 * ```ts
 * const validateUser = createStandardValidatorResultSync(userSchema);
 *
 * const result = validateUser({ name: "Ada", age: 37 });
 * ```
 */
export const createStandardValidatorResultSync = <TSchema extends StandardSchemaV1>(
  schema: TSchema,
): ((input: unknown) => Result<StandardSchemaV1.InferOutput<TSchema>, ValidationError>) => {
  return (input: unknown): Result<StandardSchemaV1.InferOutput<TSchema>, ValidationError> => {
    try {
      return standardValidateResultSync(input, schema);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Async schemas are not supported by standardValidateResultSync"
      ) {
        throw new Error("Async schemas are not supported by createStandardValidatorResultSync", {
          cause: error,
        });
      }

      throw error;
    }
  };
};

/**
 * Creates a Standard Schema validator that returns a `ResultAsync`.
 *
 * The returned function behaves like {@link standardValidateResult}, bound to
 * `schema`.
 *
 * @template TSchema - The Standard Schema type.
 * @param schema - The schema to validate against.
 * @returns An async validator function returning a `ResultAsync`.
 * @throws {TypeError} When the returned validator is called and the provided value does not
 *   expose a callable Standard Schema `~standard.validate` implementation at runtime.
 * @throws {unknown} Any error thrown or rejected by the schema's Standard Schema
 *   `validate` function when the returned validator is called.
 *
 * @example
 * ```ts
 * const validateUser = createStandardValidatorResult(userSchema);
 *
 * const result = await validateUser({ name: "Ada", age: 37 });
 * ```
 */
export const createStandardValidatorResult = <TSchema extends StandardSchemaV1>(
  schema: TSchema,
): ((input: unknown) => ResultAsync<StandardSchemaV1.InferOutput<TSchema>, ValidationError>) => {
  return (input: unknown): ResultAsync<StandardSchemaV1.InferOutput<TSchema>, ValidationError> =>
    standardValidateResult(input, schema);
};
