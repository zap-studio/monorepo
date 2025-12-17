/**
 * Email type.
 */
export type Email = string;

/**
 * Configuration for email validation.
 *
 * - `allowPlus` - Whether to allow plus addressing (e.g. `user+tag@example.com`).
 * - `allowSubdomains` - Whether to allow subdomains (e.g. `user@mail.example.com`).
 */
export type EmailValidationConfig = {
  allowPlus?: boolean;
  allowSubdomains?: boolean;
};
