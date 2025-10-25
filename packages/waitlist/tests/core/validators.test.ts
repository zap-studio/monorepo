import { describe, expect, it } from "vitest";
import { validateEmail } from "../../src/core/validators";
import type { EmailValidationConfig } from "../../src/types";

describe("validateEmail", () => {
	describe("basic email validation", () => {
		it("accepts valid email addresses", () => {
			const result = validateEmail("test@example.com");
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("accepts emails with dots in local part", () => {
			const result = validateEmail("first.last@example.com");
			expect(result.valid).toBe(true);
		});

		it("accepts emails with numbers", () => {
			const result = validateEmail("user123@example.com");
			expect(result.valid).toBe(true);
		});

		it("rejects invalid email format", () => {
			const result = validateEmail("invalid-email");
			expect(result.valid).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("rejects email without @", () => {
			const result = validateEmail("testexample.com");
			expect(result.valid).toBe(false);
		});

		it("rejects email without domain", () => {
			const result = validateEmail("test@");
			expect(result.valid).toBe(false);
		});

		it("rejects empty string", () => {
			const result = validateEmail("");
			expect(result.valid).toBe(false);
		});
	});

	describe("plus addressing", () => {
		it("disallows plus addressing by default", () => {
			const result = validateEmail("user+tag@example.com");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Plus addressing not allowed");
		});

		it("allows plus addressing when explicitly enabled", () => {
			const config: EmailValidationConfig = {
				allowPlus: true,
			};
			const result = validateEmail("user+tag@example.com", config);
			expect(result.valid).toBe(true);
		});

		it("rejects plus addressing when disabled", () => {
			const config: EmailValidationConfig = {
				allowPlus: false,
			};
			const result = validateEmail("user+tag@example.com", config);
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Plus addressing not allowed");
		});

		it("allows emails without plus when plus is disabled", () => {
			const config: EmailValidationConfig = {
				allowPlus: false,
			};
			const result = validateEmail("user@example.com", config);
			expect(result.valid).toBe(true);
		});
	});

	describe("subdomain validation", () => {
		it("disallows subdomains by default", () => {
			const result = validateEmail("user@mail.example.com");
			expect(result.valid).toBe(false);
		});

		it("allows subdomains when explicitly enabled", () => {
			const config: EmailValidationConfig = {
				allowSubdomains: true,
			};
			const result = validateEmail("user@mail.example.com", config);
			expect(result.valid).toBe(true);
		});

		it("rejects subdomains when disabled", () => {
			const config: EmailValidationConfig = {
				allowSubdomains: false,
			};
			const result = validateEmail("user@mail.example.com", config);
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Subdomains not allowed");
		});

		it("allows two-part domains when subdomains disabled", () => {
			const config: EmailValidationConfig = {
				allowSubdomains: false,
			};
			const result = validateEmail("user@example.com", config);
			expect(result.valid).toBe(true);
		});

		it("rejects multiple subdomain levels when disabled", () => {
			const config: EmailValidationConfig = {
				allowSubdomains: false,
			};
			const result = validateEmail("user@deep.mail.example.com", config);
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Subdomains not allowed");
		});
	});

	describe("combined configurations", () => {
		it("validates with both restrictions enabled", () => {
			const config: EmailValidationConfig = {
				allowPlus: false,
				allowSubdomains: false,
			};

			expect(validateEmail("user@example.com", config).valid).toBe(true);
			expect(validateEmail("user+tag@example.com", config).valid).toBe(false);
			expect(validateEmail("user@mail.example.com", config).valid).toBe(false);
			expect(validateEmail("user+tag@mail.example.com", config).valid).toBe(
				false,
			);
		});

		it("validates with both restrictions disabled", () => {
			const config: EmailValidationConfig = {
				allowPlus: true,
				allowSubdomains: true,
			};

			expect(validateEmail("user@example.com", config).valid).toBe(true);
			expect(validateEmail("user+tag@example.com", config).valid).toBe(true);
			expect(validateEmail("user@mail.example.com", config).valid).toBe(true);
			expect(validateEmail("user+tag@mail.example.com", config).valid).toBe(
				true,
			);
		});

		it("doesn't validate with empty config object", () => {
			const config: EmailValidationConfig = {};
			const result = validateEmail("user+tag@mail.example.com", config);
			expect(result.valid).toBe(false);
		});
	});
});
