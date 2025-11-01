import type { Email, EmailValidationConfig } from "../types";
import { EmailSchema } from "./schemas";

/**
 * Validates an email address based on the provided configuration.
 *
 * @example
 * const result = validateEmail("test@example.com", {
 *   emailValidation: {
 *     allowPlus: false,
 *     allowSubdomains: false,
 *   },
 * });
 */
export function validateEmail(
  email: Email,
  config?: EmailValidationConfig
): { valid: boolean; error?: string } {
  const result = EmailSchema.safeParse(email);
  if (!result.success) {
    return { valid: false, error: result.error.message };
  }

  const base: EmailValidationConfig = config || {
    allowPlus: false,
    allowSubdomains: false,
  };

  // Check for allowPlus configuration
  if (!base.allowPlus && email.includes("+")) {
    return { valid: false, error: "Plus addressing not allowed" };
  }

  // Check for subdomain configuration
  if (!base.allowSubdomains) {
    const domainPart = email.split("@")[1];
    const parts = domainPart?.split(".") || [];

    // A domain like "example.com" has 2 parts, "mail.example.com" has 3+
    if (parts.length > 2) {
      return { valid: false, error: "Subdomains not allowed" };
    }
  }

  return { valid: true };
}
