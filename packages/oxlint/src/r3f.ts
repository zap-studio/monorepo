import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorR3fRules } from "./_rules-react-doctor-r3f.ts";

export const r3fJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const r3fRules: DummyRuleMap = prefixed("react-doctor", reactDoctorR3fRules);

const r3f: OxlintConfig = defineConfig({
  jsPlugins: r3fJsPlugins,
  rules: r3fRules,
});

export default r3f;
