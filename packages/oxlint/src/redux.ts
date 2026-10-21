import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorReduxRules } from "./_rules-react-doctor-redux.ts";

export const reduxJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const reduxRules: DummyRuleMap = prefixed("react-doctor", reactDoctorReduxRules);

const redux: OxlintConfig = defineConfig({
  jsPlugins: reduxJsPlugins,
  rules: reduxRules,
});

export default redux;
