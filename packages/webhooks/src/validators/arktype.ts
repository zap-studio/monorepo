import type { SchemaValidator, ValidationResult } from "../types";

/**
 * Example: Create a schema validator from an ArkType schema
 *
 * @example
 * ```ts
 * import { type } from "arktype";
 *
 * const schema = type({
 *   id: "string",
 *   amount: "number>0",
 * });
 *
 * router.register("payment", {
 *   schema: arktypeValidator(schema),
 *   handler: async ({ payload, ack }) => {
 *     return ack({ status: 200 });
 *   },
 * });
 * ```
 */
export function arktypeValidator<T>(
  // biome-ignore lint/suspicious/noExplicitAny: ArkType schema type
  schema: any
): SchemaValidator<T> {
  return {
    validate: (data: unknown): ValidationResult<T> => {
      const result = schema(data);

      if (result.problems) {
        return {
          success: false,
          errors: result.problems.map(
            // biome-ignore lint/suspicious/noExplicitAny: ArkType problem type
            (problem: any) => ({
              path: problem.path || [],
              message: problem.message,
            })
          ),
        };
      }

      return {
        success: true,
        data: result.data,
      };
    },
  };
}
