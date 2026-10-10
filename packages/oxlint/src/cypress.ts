import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { cypressRules } from "./_rules-cypress.ts";

const cypressJsPlugins: ExternalPluginEntry[] = [
  { name: "cypress", specifier: resolvePlugin("eslint-plugin-cypress") },
];

const cypressRulesFinal: DummyRuleMap = prefixed("cypress", cypressRules);

const cypress: OxlintConfig = defineConfig({
  jsPlugins: cypressJsPlugins,
  rules: cypressRulesFinal,
});

export default cypress;

export { cypressJsPlugins, cypressRulesFinal };
