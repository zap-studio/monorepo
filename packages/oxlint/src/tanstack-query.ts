import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorTanstackQueryRules } from "./_rules-react-doctor-tanstack-query.ts";
import { tanstackQueryRules } from "./_rules-tanstack-query.ts";

export const tanstackQueryJsPlugins: ExternalPluginEntry[] = [
  { name: "tanstack-query", specifier: resolvePlugin("@tanstack/eslint-plugin-query") },
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const tanstackQueryRulesFinal: DummyRuleMap = {
  ...prefixed("tanstack-query", tanstackQueryRules),
  ...prefixed("react-doctor", reactDoctorTanstackQueryRules),
};

const tanstackQuery: OxlintConfig = defineConfig({
  jsPlugins: tanstackQueryJsPlugins,
  rules: tanstackQueryRulesFinal,
});

export default tanstackQuery;
