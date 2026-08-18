import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { tanstackRouterRules } from "./_rules-tanstack-router.ts";

export const tanstackRouterJsPlugins: ExternalPluginEntry[] = [
  { name: "tanstack-router", specifier: resolvePlugin("@tanstack/eslint-plugin-router") },
];

export const tanstackRouterRulesFinal: DummyRuleMap = prefixed(
  "tanstack-router",
  tanstackRouterRules,
);

const tanstackRouter: OxlintConfig = defineConfig({
  jsPlugins: tanstackRouterJsPlugins,
  rules: tanstackRouterRulesFinal,
});

export default tanstackRouter;
