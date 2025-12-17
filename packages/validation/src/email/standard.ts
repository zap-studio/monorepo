import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Email } from "./types";

/**
 * Email schema type.
 *
 * This type is a union of the StandardSchemaV1 type and a custom type that
 * represents the email schema.
 *
 * The StandardSchemaV1 type is a generic type that takes two type parameters:
 * the input type and the output type.
 */
export type EmailSchema = StandardSchemaV1<Email, Email>;
