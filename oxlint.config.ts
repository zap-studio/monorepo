import { defineConfig } from "oxlint";

import { eslintPluginRules } from "./oxlint-plugin-rules.ts";

export default defineConfig({
  plugins: [
    "eslint",
    "typescript",
    "unicorn",
    "oxc",
    "react",
    "react-perf",
    "import",
    "jsx-a11y",
    "jsdoc",
    "node",
    "promise",
    "vitest",
  ],
  ignorePatterns: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "tools/oxlint/anti-slop/**"],
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    "eslint-plugin-playwright",
    "eslint-plugin-regexp",
    "eslint-plugin-sonarjs",
    "@e18e/eslint-plugin",
  ],
  rules: {
    "import/no-cycle": ["error", { maxDepth: 3 }],
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
    ...eslintPluginRules,
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error",
  },
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
