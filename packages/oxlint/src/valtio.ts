import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorValtioRules } from "./_rules-react-doctor-valtio.ts";

export const valtioJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const valtioRules: DummyRuleMap = prefixed("react-doctor", reactDoctorValtioRules);

const valtio: OxlintConfig = defineConfig({
  jsPlugins: valtioJsPlugins,
  rules: valtioRules,
});

export default valtio;
