import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { antiSlopSpecifier, resolvePlugin } from "./_resolve.ts";
import { e18eRules } from "./_rules-e18e.ts";
import { githubRules } from "./_rules-github.ts";
import { regexpRules } from "./_rules-regexp.ts";
import { sonarjsRules } from "./_rules-sonarjs.ts";

export const basePlugins: NonNullable<OxlintConfig["plugins"]> = [
  "eslint",
  "typescript",
  "unicorn",
  "oxc",
  "import",
  "jsdoc",
  "node",
  "promise",
];

export const baseJsPlugins: ExternalPluginEntry[] = [
  { name: "anti-slop", specifier: antiSlopSpecifier },
  { name: "regexp", specifier: resolvePlugin("eslint-plugin-regexp") },
  { name: "sonarjs", specifier: resolvePlugin("eslint-plugin-sonarjs") },
  { name: "github", specifier: resolvePlugin("eslint-plugin-github") },
  { name: "e18e", specifier: resolvePlugin("@e18e/eslint-plugin") },
];

export const baseRules: DummyRuleMap = {
  "import/no-cycle": ["error", { maxDepth: 3 }],
  "eslint/func-style": ["error", "expression"],
  ...prefixed("regexp", regexpRules),
  ...prefixed("sonarjs", sonarjsRules),
  ...prefixed("github", githubRules),
  ...prefixed("e18e", e18eRules),
  "anti-slop/no-chained-type-assertions": "error",
  "anti-slop/no-conditional-empty-object-spread": "error",
  "anti-slop/no-known-value-widening": "error",
  "anti-slop/no-module-mocking": "error",
  "anti-slop/no-object-parameters": "error",
  "anti-slop/no-reflect-apply": "error",
  "anti-slop/no-reflect-get": "error",
  "anti-slop/no-shape-in-symbol-names": "error",
  "anti-slop/no-unknown-type-aliases": "error",
  "anti-slop/no-widen-then-assert": "error",
  "anti-slop/require-safety-comment-for-type-assertion": "error",
};

export const baseOptions: NonNullable<OxlintConfig["options"]> = {
  typeAware: true,
  typeCheck: true,
};

const base: OxlintConfig = defineConfig({
  plugins: basePlugins,
  jsPlugins: baseJsPlugins,
  rules: baseRules,
  options: baseOptions,
});

export default base;
