import type { z } from "zod";
import type { SchemaValidator, ValidationResult } from "../../types";

/**
 * Create a schema validator from a Zod schema
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { zodValidator } from "@zap-studio/webhooks/adapters";
 *
 * const schema = z.object({
 *   id: z.string(),
 *   amount: z.number().positive(),
 * });
 *
 * router.register("/payment", {
 *   schema: zodValidator(schema),
 *   handler: async ({ payload, ack }) => {
 *     // payload is validated and typed
 *     return ack({ status: 200 });
 *   },
 * });
 * ```
 */
export function zodValidator<T>(schema: z.ZodType<T>): SchemaValidator<T> {
	return {
		validate: (data: unknown): ValidationResult<T> => {
			const result = schema.safeParse(data);

			if (result.success) {
				return {
					success: true,
					data: result.data,
				};
			}

			return {
				success: false,
				errors: result.error.issues.map((err) => ({
					path: err.path.map(String),
					message: err.message,
				})),
			};
		},
	};
}
