import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { tanstackQueryRules } from "./_rules-tanstack-query.ts";
import { tanstackRouterRules } from "./_rules-tanstack-router.ts";
import react from "./react.ts";

export const tanstackJsPlugins: ExternalPluginEntry[] = [
  { name: "tanstack-query", specifier: resolvePlugin("@tanstack/eslint-plugin-query") },
  { name: "tanstack-router", specifier: resolvePlugin("@tanstack/eslint-plugin-router") },
];

export const tanstackRules: DummyRuleMap = {
  ...prefixed("tanstack-query", tanstackQueryRules),
  ...prefixed("tanstack-router", tanstackRouterRules),
};

const tanstack: OxlintConfig = defineConfig({
  extends: [react],
  jsPlugins: tanstackJsPlugins,
  rules: tanstackRules,
});

export default tanstack;
