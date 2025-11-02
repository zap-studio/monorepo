import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferOutput,
} from "valibot";
import { safeParse, safeParseAsync } from "valibot";
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
export function valibotValidator<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaValidator<InferOutput<TSchema>>;
export function valibotValidator<
  TSchema extends BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaValidator<InferOutput<TSchema>>;
export function valibotValidator<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaValidator<InferOutput<TSchema>> {
  return {
    validate: <TData = unknown>(
      data: TData
    ):
      | ValidationResult<InferOutput<TSchema>>
      | Promise<ValidationResult<InferOutput<TSchema>>> => {
      // Handle async schemas
      if ("async" in schema && schema.async === true) {
        const asyncSchema = schema as BaseSchemaAsync<
          unknown,
          unknown,
          BaseIssue<unknown>
        >;
        return safeParseAsync(asyncSchema, data).then((asyncResult) => {
          if (asyncResult.success) {
            return {
              success: true,
              data: asyncResult.output,
            };
          }

          return {
            success: false,
            errors: asyncResult.issues.map((issue) => ({
              path: issue.path?.map((item) => String(item.key)) || [],
              message: issue.message,
            })),
          };
        });
      }

      // Handle sync schemas
      const syncSchema = schema as BaseSchema<
        unknown,
        unknown,
        BaseIssue<unknown>
      >;
      const parseResult = safeParse(syncSchema, data);

      if (parseResult.success) {
        return {
          success: true,
          data: parseResult.output,
        };
      }

      return {
        success: false,
        errors: parseResult.issues.map((issue) => ({
          path: issue.path?.map((item) => String(item.key)) || [],
          message: issue.message,
        })),
      };
    },
  };
}
