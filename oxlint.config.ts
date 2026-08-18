import react from "@zap-studio/oxlint/react";
import testing from "@zap-studio/oxlint/testing";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [react, testing],
  ignorePatterns: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "packages/oxlint/src/anti-slop/**"],
});
