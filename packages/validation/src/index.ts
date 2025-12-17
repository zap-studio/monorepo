import type { StandardSchemaV1 } from "@standard-schema/spec";
import { ValidationError } from "./errors";

/**
 * Checks if a value is a Standard Schema.
 *
 * @example
 * if (isStandardSchema(value)) {
 *   console.log("Value is a Standard Schema and TypeScript knows it");
 * }
 */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    "~standard" in value
  );
}

/**
 * Creates a synchronous Standard Schema validator.
 *
 * This helper calls `schema["~standard"].validate` and throws if the schema
 * performs asynchronous validation (returns a Promise).
 */
export function createSyncStandardValidator<TSchema extends StandardSchemaV1>(
  schema: TSchema
): (
  input: unknown
) => StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>> {
  return (input: unknown) => {
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
 * @example
 * // Throwing
 * try {
 *   const result = await standardValidate(schema, data, true);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error("Validation failed!", error.issues);
 *   }
 * }
 *
 * // Without throwing
 * const result = await standardValidate(schema, data, false);
 * if (result.issues) {
 *   console.error("Validation failed!", result.issues);
 * } else {
 *   console.log("Validation passed!", result.value);
 * }
 */
export async function standardValidate<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  throwOnError: true
): Promise<StandardSchemaV1.InferOutput<TSchema>>;

export async function standardValidate<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  throwOnError: false
): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

export async function standardValidate<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
  throwOnError: boolean
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) {
    result = await result;
  }

  if (result.issues) {
    if (throwOnError) {
      throw new ValidationError([...result.issues]);
    }
    return result;
  }

  return throwOnError ? result.value : result;
}
