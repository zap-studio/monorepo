import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorZustandRules } from "./_rules-react-doctor-zustand.ts";

export const zustandJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const zustandRules: DummyRuleMap = prefixed("react-doctor", reactDoctorZustandRules);

const zustand: OxlintConfig = defineConfig({
  jsPlugins: zustandJsPlugins,
  rules: zustandRules,
});

export default zustand;
