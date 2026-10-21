import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { playwrightRules } from "./_rules-playwright.ts";

export const playwrightJsPlugins: ExternalPluginEntry[] = [
  { name: "playwright", specifier: resolvePlugin("eslint-plugin-playwright") },
];

export const playwrightRulesFinal: DummyRuleMap = prefixed("playwright", playwrightRules);

const playwright: OxlintConfig = defineConfig({
  jsPlugins: playwrightJsPlugins,
  rules: playwrightRulesFinal,
});

export default playwright;
