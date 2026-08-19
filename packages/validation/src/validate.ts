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

import { ValidationError } from "./errors.ts";

/**
 * Duck-types a value as a thenable rather than checking `instanceof Promise`,
 * which evaluates `false` for a Promise constructed in a different
 * JavaScript realm (a separate `vm.Context`, iframe, or worker) even though
 * it is a spec-compliant Promise there. A conforming Standard Schema is
 * allowed to return such a value.
 */
const isPromiseLike = <T>(value: T | PromiseLike<T>): value is PromiseLike<T> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  // SAFETY: only reading `then` to duck-type a thenable; not calling it or treating `value` as a resolved PromiseLike until this check passes.
  // oxlint-disable-next-line github/no-then -- feature-detecting a `then` method to duck-type a thenable, not chaining a Promise.
  return typeof (value as { then?: unknown }).then === "function";
};

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
  if (isPromiseLike(result)) {
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

  if (isPromiseLike(result)) {
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
