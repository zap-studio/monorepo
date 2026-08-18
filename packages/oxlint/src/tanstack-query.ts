import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { tanstackQueryRules } from "./_rules-tanstack-query.ts";

export const tanstackQueryJsPlugins: ExternalPluginEntry[] = [
  { name: "tanstack-query", specifier: resolvePlugin("@tanstack/eslint-plugin-query") },
];

export const tanstackQueryRulesFinal: DummyRuleMap = prefixed("tanstack-query", tanstackQueryRules);

const tanstackQuery: OxlintConfig = defineConfig({
  jsPlugins: tanstackQueryJsPlugins,
  rules: tanstackQueryRulesFinal,
});

export default tanstackQuery;
