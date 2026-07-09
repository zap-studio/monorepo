import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, tanstack, vitest],
  ignorePatterns: core.ignorePatterns,
  options: {
    typeAware: true,
    typeCheck: true,
  },
  overrides: [
    {
      files: [
        "**/benchmarks/**/*.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.node.test.{ts,tsx}",
        "**/*.browser.test.{ts,tsx}",
        "**/__tests__/**/*.{ts,tsx}",
      ],
      rules: {
        "func-style": "off",
        "no-await-in-loop": "off",
        "prefer-destructuring": "off",
        "typescript/no-unsafe-argument": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-return": "off",
        "typescript/no-unsafe-type-assertion": "off",
        "typescript/only-throw-error": "off",
        "typescript/promise-function-async": "off",
        "typescript/strict-void-return": "off",
        "typescript/unbound-method": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/no-await-expression-member": "off",
        "unicorn/prefer-response-static-json": "off",
        "vitest/max-expects": "off",
      },
    },
  ],
});
