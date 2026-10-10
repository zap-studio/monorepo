import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { solidRules } from "./_rules-solid.ts";

const solidJsPlugins: ExternalPluginEntry[] = [
  { name: "solid", specifier: resolvePlugin("eslint-plugin-solid") },
];

const solidRulesFinal: DummyRuleMap = prefixed("solid", solidRules);

const solid: OxlintConfig = defineConfig({
  jsPlugins: solidJsPlugins,
  rules: solidRulesFinal,
});

export default solid;

export { solidJsPlugins, solidRulesFinal };
