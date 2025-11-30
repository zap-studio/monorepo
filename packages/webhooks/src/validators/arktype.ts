import type { Type } from "arktype";
import { ArkErrors } from "arktype";
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
export function arktypeValidator<T>(schema: Type<T>): SchemaValidator<T> {
  return {
    validate: <TData = unknown>(data: TData): ValidationResult<T> => {
      const result = schema(data);

      if (result instanceof ArkErrors) {
        return {
          success: false,
          errors: result.map((problem) => {
            let path: string[] = [];
            if (Array.isArray(problem.path)) {
              path = problem.path as string[];
            } else if (problem.path) {
              path = [String(problem.path)];
            }

            return {
              path,
              message: problem.message,
            };
          }),
        };
      }

      return {
        success: true,
        data: result as T,
      };
    },
  };
}
