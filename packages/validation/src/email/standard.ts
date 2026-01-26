import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createSyncStandardValidator } from "..";
import type { Email, EmailValidationConfig } from "./types";

/**
 * Email schema type.
 *
 * This type is a Standard Schema-compatible schema for email addresses.
 */
export type EmailSchema = StandardSchemaV1<Email, Email>;

/**
 * Email schema.
 *
 * @example
 * const emailSchema: EmailSchema = {
 *   "~standard": {
 *     version: 1,
 *     vendor: "@zap-studio/validation/email",
 *     types: {
 *       input: "",
 *       output: "",
 *     },
 *   },
 * };
 *
 * const result = emailSchema.validate("test@example.com");
 * console.log(result); // { value: "test@example.com" }
 *
 * const validate = createSyncStandardValidator(emailSchema);
 * const result = validate("not-an-email");
 * console.log(result); // { value: "not-an-email", issues: [{ path: [], message: "Email must contain a local part and domain" }] }
 */
export const EmailSchema: EmailSchema = {
  "~standard": {
    version: 1,
    vendor: "@zap-studio/validation/email",
    types: {
      input: "" as Email,
      output: "" as Email,
    },
    validate(input: unknown) {
      const value = String(input ?? "") as Email;
      const issues: StandardSchemaV1.Issue[] = [];

      const parts = value.split("@");

      if (parts.length === 2) {
        const local = parts[0] ?? "";
        const domain = parts[1] ?? "";

        if (local.length === 0) {
          issues.push({
            path: [],
            message: "Email local part cannot be empty (e.g. user@example.com)",
          });
        }

        const domainParts = domain.split(".");
        if (domainParts.length < 2 || domainParts.some((p) => p.length === 0)) {
          issues.push({
            path: [],
            message:
              "Email domain must contain at least two parts (e.g. example.com)",
          });
        }
      } else {
        issues.push({
          path: [],
          message:
            "Email must contain a local part and domain (e.g. user@example.com)",
        });
      }

      if (issues.length > 0) {
        return { value, issues };
      }

      return { value };
    },
  },
};

/**
 * Validate an email address with the email schema.
 *
 * @example
 * const result = validateEmail("test@example.com");
 * console.log(result); // { valid: true }
 *
 * const result = validateEmail("not-an-email");
 * console.log(result); // { valid: false, error: "Email must contain a local part and domain" }
 */
const validateWithSchema = createSyncStandardValidator(EmailSchema);

/**
 * Validate an email address with the email schema.
 *
 * - `allowPlus` - Whether to allow plus addressing (e.g. `user+tag@example.com`).
 * - `allowSubdomains` - Whether to allow subdomains (e.g. `user@mail.example.com`).
 *
 * @default
 * {
 *   allowPlus: false,
 *   allowSubdomains: false,
 * }
 *
 * @example
 * const result = validateEmail("test+tag@example.com", { allowPlus: true });
 * console.log(result); // { valid: true }
 *
 * const result = validateEmail("not-an-email");
 * console.log(result); // { valid: false, error: "Email must contain a local part and domain" }
 */
export function validateEmail(
  email: Email,
  config?: EmailValidationConfig
): { valid: boolean; error?: string } {
  const base = validateWithSchema(email);

  if (base.issues && base.issues.length > 0) {
    return { valid: false, error: base.issues[0]?.message };
  }

  const effective: EmailValidationConfig = {
    allowPlus: false,
    allowSubdomains: false,
    ...config,
  };

  if (!effective.allowPlus && email.includes("+")) {
    return { valid: false, error: "Plus addressing not allowed" };
  }

  if (!effective.allowSubdomains) {
    const domainPart = email.split("@")[1];
    const parts = domainPart?.split(".") || [];
    if (parts.length > 2) {
      return { valid: false, error: "Subdomains not allowed" };
    }
  }

  return { valid: true };
}
