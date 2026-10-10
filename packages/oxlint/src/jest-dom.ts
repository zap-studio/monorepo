import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { jestDomRules } from "./_rules-jest-dom.ts";

const jestDomJsPlugins: ExternalPluginEntry[] = [
  { name: "jest-dom", specifier: resolvePlugin("eslint-plugin-jest-dom") },
];

const jestDomRulesFinal: DummyRuleMap = prefixed("jest-dom", jestDomRules);

const jestDom: OxlintConfig = defineConfig({
  jsPlugins: jestDomJsPlugins,
  rules: jestDomRulesFinal,
});

export default jestDom;

export { jestDomJsPlugins, jestDomRulesFinal };
