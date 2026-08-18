import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { solidRules } from "./_rules-solid.ts";

export const solidJsPlugins: ExternalPluginEntry[] = [
  { name: "solid", specifier: resolvePlugin("eslint-plugin-solid") },
];

export const solidRulesFinal: DummyRuleMap = prefixed("solid", solidRules);

const solid: OxlintConfig = defineConfig({
  jsPlugins: solidJsPlugins,
  rules: solidRulesFinal,
});

export default solid;
