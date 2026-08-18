import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorStyledComponentsRules } from "./_rules-react-doctor-styled-components.ts";

export const styledComponentsJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const styledComponentsRules: DummyRuleMap = prefixed(
  "react-doctor",
  reactDoctorStyledComponentsRules,
);

const styledComponents: OxlintConfig = defineConfig({
  jsPlugins: styledComponentsJsPlugins,
  rules: styledComponentsRules,
});

export default styledComponents;
