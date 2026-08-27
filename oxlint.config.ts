import base from "@zap-studio/oxlint/base";
import vitest from "@zap-studio/oxlint/vitest";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, vitest],
  ignorePatterns: ["packages/oxlint/src/anti-slop/**"],
});
