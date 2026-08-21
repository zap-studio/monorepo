import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

export const reactCompilerPlugins: NonNullable<OxlintConfig["plugins"]> = ["react"];

// oxlint 1.79.0 replaced the single nursery `react/react-compiler` rule with these 22
// category-specific rules covering the same Rules-of-React checks — see
// https://oxc.rs/blog/2026-08-18-react-compiler-support.
export const reactCompilerRules: DummyRuleMap = {
  "react/capitalized-calls": "error",
  "react/error-boundaries": "error",
  "react/exhaustive-effect-dependencies": "error",
  "react/globals": "error",
  "react/hooks": "error",
  "react/immutability": "error",
  "react/incompatible-library": "error",
  "react/invariant": "error",
  "react/memo-dependencies": "error",
  "react/no-deriving-state-in-effects": "error",
  "react/preserve-manual-memoization": "error",
  "react/purity": "error",
  "react/refs": "error",
  "react/rule-suppression": "error",
  "react/set-state-in-effect": "error",
  "react/set-state-in-render": "error",
  "react/static-components": "error",
  "react/syntax": "error",
  "react/todo": "error",
  "react/unsupported-syntax": "error",
  "react/use-memo": "error",
  "react/void-use-memo": "error",
};

const reactCompiler: OxlintConfig = defineConfig({
  plugins: reactCompilerPlugins,
  rules: reactCompilerRules,
});

export default reactCompiler;
