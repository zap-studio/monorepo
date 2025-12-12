import type { StandardSchemaV1 } from "@standard-schema/spec";
import { ValidationError } from "./errors";

/**
 * Type guard to check if a value is a Standard Schema
 */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    "~standard" in value
  );
}

/**
 * Validate data against a Standard Schema
 *
 * @throws {ValidationError} When validation fails and throwOnError is true
 */
export async function validateSchema<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  data: unknown,
  throwOnError = true
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
> {
  let result = schema["~standard"].validate(data);
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
