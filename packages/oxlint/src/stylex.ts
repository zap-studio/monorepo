import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { stylexRules } from "./_rules-stylex.ts";

export const stylexJsPlugins: ExternalPluginEntry[] = [
  { name: "stylex", specifier: resolvePlugin("@stylexjs/eslint-plugin") },
];

export const stylexRulesFinal: DummyRuleMap = prefixed("stylex", stylexRules);

const stylex: OxlintConfig = defineConfig({
  jsPlugins: stylexJsPlugins,
  rules: stylexRulesFinal,
});

export default stylex;
