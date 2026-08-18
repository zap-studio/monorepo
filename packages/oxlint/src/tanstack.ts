import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorTanstackRules } from "./_rules-react-doctor-tanstack.ts";

export const tanstackJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const tanstackRules: DummyRuleMap = prefixed("react-doctor", reactDoctorTanstackRules);

const tanstack: OxlintConfig = defineConfig({
  jsPlugins: tanstackJsPlugins,
  rules: tanstackRules,
});

export default tanstack;
