import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorRules } from "./_rules-react-doctor.ts";

export const reactDoctorJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const reactDoctorRulesFinal: DummyRuleMap = prefixed("react-doctor", reactDoctorRules);

const reactDoctor: OxlintConfig = defineConfig({
  jsPlugins: reactDoctorJsPlugins,
  rules: reactDoctorRulesFinal,
});

export default reactDoctor;
