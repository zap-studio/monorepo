import type { SchemaValidator, ValidationResult } from "../types";

/**
 * Example: Create a schema validator from a Valibot schema
 *
 * @example
 * ```ts
 * import * as v from "valibot";
 *
 * const schema = v.object({
 *   id: v.string(),
 *   amount: v.pipe(v.number(), v.minValue(0)),
 * });
 *
 * router.register("payment", {
 *   schema: valibotValidator(schema),
 *   handler: async ({ payload, ack }) => {
 *     return ack({ status: 200 });
 *   },
 * });
 * ```
 */
export function valibotValidator<T>(
  // biome-ignore lint/suspicious/noExplicitAny: Valibot schema type
  schema: any
): SchemaValidator<T> {
  return {
    validate: (data: unknown): ValidationResult<T> => {
      try {
        const result =
          // biome-ignore lint/suspicious/noExplicitAny: Valibot parse function
          (schema as any).parse?.(data) ?? (schema as any)._parse?.(data, {});
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        // biome-ignore lint/suspicious/noExplicitAny: Valibot error type
        const valibotError = error as any;
        return {
          success: false,
          errors: valibotError.issues?.map(
            // biome-ignore lint/suspicious/noExplicitAny: Valibot issue type
            (issue: any) => ({
              path:
                issue.path?.map(
                  // biome-ignore lint/suspicious/noExplicitAny: Path item type
                  (item: any) => item.key || String(item)
                ) || [],
              message: issue.message,
            })
          ) || [{ message: valibotError.message || "Validation failed" }],
        };
      }
    },
  };
}
