import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { cypressRules } from "./_rules-cypress.ts";

export const cypressJsPlugins: ExternalPluginEntry[] = [
  { name: "cypress", specifier: resolvePlugin("eslint-plugin-cypress") },
];

export const cypressRulesFinal: DummyRuleMap = prefixed("cypress", cypressRules);

const cypress: OxlintConfig = defineConfig({
  jsPlugins: cypressJsPlugins,
  rules: cypressRulesFinal,
});

export default cypress;
