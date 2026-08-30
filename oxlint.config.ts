import base from "@zap-studio/oxlint/base";
import jsxRuntimeAutomatic from "@zap-studio/oxlint/jsx-runtime-automatic";
import react from "@zap-studio/oxlint/react";
import reactDoctor from "@zap-studio/oxlint/react-doctor";
import {
  testingLibraryJsPlugins,
  testingLibraryRulesFinal,
} from "@zap-studio/oxlint/testing-library";
import vitest from "@zap-studio/oxlint/vitest";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react, reactDoctor, jsxRuntimeAutomatic, vitest],
  ignorePatterns: ["packages/oxlint/src/anti-slop/**"],
  overrides: [
    {
      files: ["packages/react-hooks/**/*.browser.test.ts"],
      jsPlugins: testingLibraryJsPlugins,
      rules: testingLibraryRulesFinal,
    },
  ],
});
