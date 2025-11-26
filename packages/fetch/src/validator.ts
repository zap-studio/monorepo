import type { StandardSchemaV1 } from "@standard-schema/spec";
import { ValidationError } from "./errors";

/**
 * Helper function to validate data using Standard Schema
 *
 * @throws {ValidationError} When `throwOnError` is true and validation fails
 *
 * @example
 * import { standardValidate } from "@zap-studio/fetch";
 * import { z } from "zod";
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 *
 * // Basic usage
 * const user = await standardValidate(UserSchema, data);
 *
 * // Non-throwing usage
 * const result = await standardValidate(UserSchema, data, false);
 * if (result.issues) {
 *   console.error("Validation failed:", result.issues);
 * } else {
 *   console.log("Success:", result.value);
 * }
 */
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
