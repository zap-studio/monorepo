/**
 * Email type.
 */
declare const EmailBrand: unique symbol;
export type Email = string & { readonly [EmailBrand]: never };

/**
 * Configuration for email validation.
 *
 * - `allowPlus` - Whether to allow plus addressing (e.g. `user+tag@example.com`).
 * - `allowSubdomains` - Whether to allow subdomains (e.g. `user@mail.example.com`).
 */
export interface EmailValidationConfig {
  allowPlus?: boolean;
  allowSubdomains?: boolean;
}
