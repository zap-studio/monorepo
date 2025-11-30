import type { AnySchema, InferType, ValidationError } from "yup";
import type { SchemaValidator, ValidationResult } from "../types";

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
 * router.register("payment", {
 *   schema: yupValidator(schema),
 *   handler: async ({ payload, ack }) => {
 *     return ack({ status: 200 });
 *   },
 * });
 * ```
 */
export function yupValidator<TSchema extends AnySchema>(
  schema: TSchema
): SchemaValidator<InferType<TSchema>> {
  return {
    validate: async <TData = unknown>(
      data: TData
    ): Promise<ValidationResult<InferType<TSchema>>> => {
      try {
        const validatedData = await schema.validate(data, {
          abortEarly: false,
        });
        return {
          success: true,
          data: validatedData,
        };
      } catch (error) {
        return handleValidationError(error);
      }
    },
  };
}

function handleValidationError<T>(error: unknown): ValidationResult<T> {
  if (error instanceof Error && "inner" in error) {
    const yupError = error as ValidationError;

    if (yupError.inner.length > 0) {
      return {
        success: false,
        errors: yupError.inner.map((err) => ({
          path: err.path ? err.path.split(".") : [],
          message: err.message,
        })),
      };
    }

    return {
      success: false,
      errors: [
        {
          path: yupError.path ? yupError.path.split(".") : [],
          message: yupError.message,
        },
      ],
    };
  }

  return {
    success: false,
    errors: [
      {
        message: error instanceof Error ? error.message : "Validation failed",
      },
    ],
  };
}
