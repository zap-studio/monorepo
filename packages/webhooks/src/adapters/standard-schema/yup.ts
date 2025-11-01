import type { SchemaValidator, ValidationResult } from "../../types";

/**
 * Example: Create a schema validator from a Yup schema
 *
 * @example
 * ```ts
 * import * as yup from "yup";
 *
 * const schema = yup.object({
 *   id: yup.string().required(),
 *   amount: yup.number().positive().required(),
 * });
 *
 * router.register("/payment", {
 *   schema: yupValidator(schema),
 *   handler: async ({ payload, ack }) => {
 *     return ack({ status: 200 });
 *   },
 * });
 * ```
 */
export function yupValidator<T>(
	// biome-ignore lint/suspicious/noExplicitAny: Yup schema type
	schema: any,
): SchemaValidator<T> {
	return {
		validate: async (data: unknown): Promise<ValidationResult<T>> => {
			try {
				const validatedData = await schema.validate(data, {
					abortEarly: false,
				});
				return {
					success: true,
					data: validatedData,
				};
			} catch (error) {
				// biome-ignore lint/suspicious/noExplicitAny: Yup ValidationError type
				const yupError = error as any;
				return {
					success: false,
					errors: yupError.inner?.map(
						// biome-ignore lint/suspicious/noExplicitAny: Yup error type
						(err: any) => ({
							path: err.path ? err.path.split(".") : [],
							message: err.message,
						}),
					) || [{ message: yupError.message }],
				};
			}
		},
	};
}
