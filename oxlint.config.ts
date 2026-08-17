import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
