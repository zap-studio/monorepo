import zapStudio from "@zap-studio/oxlint/full";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [zapStudio],
  ignorePatterns: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "packages/oxlint/src/anti-slop/**"],
});
