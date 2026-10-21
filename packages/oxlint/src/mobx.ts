import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorMobxRules } from "./_rules-react-doctor-mobx.ts";

export const mobxJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const mobxRules: DummyRuleMap = prefixed("react-doctor", reactDoctorMobxRules);

const mobx: OxlintConfig = defineConfig({
  jsPlugins: mobxJsPlugins,
  rules: mobxRules,
});

export default mobx;
