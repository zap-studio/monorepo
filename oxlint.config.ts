import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
